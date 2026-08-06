"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import GoalFilters from "@/components/GoalFilters";
import GoalCard from "@/components/GoalCard";
import GoalListRow from "@/components/GoalListRow";
import GoalProgressBar from "@/components/GoalProgressBar";
import { EmptyState, ErrorState, LoadingState } from "@/components/GoalStates";
import PageHero from "@/components/PageHero";
import SearchInput from "@/components/SearchInput";
import SkeletonCard from "@/components/SkeletonCard";
import StatCard from "@/components/StatCard";
import { useToast } from "@/components/ToastProvider";
import ViewToggle, { type GoalsViewMode } from "@/components/ViewToggle";
import {
  fetchGoalProjection,
  fetchGoals,
  type FinancialGoal,
  type ProjectionResponse
} from "@/lib/api/goals";
import {
  filterGoalsByStatus,
  getGoalStatus,
  searchGoals,
  sortGoals,
  summarizeGoals,
  type GoalSortKey,
  type GoalStatus
} from "@/lib/goal-analytics";
import { formatCurrency, formatProgressPercent } from "@/lib/format";

type GoalsPageState =
  | { status: "loading" }
  | { status: "ready"; goals: FinancialGoal[] }
  | { status: "error"; message: string };

const VIEW_PREFERENCE_KEY = "investwise-goals-view";

export default function GoalsPage() {
  const [state, setState] = useState<GoalsPageState>({ status: "loading" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<GoalSortKey>("newest");
  const [statusFilter, setStatusFilter] = useState<GoalStatus | "all">("all");
  const [viewMode, setViewMode] =
    useState<GoalsViewMode>(getInitialViewMode);
  const [projections, setProjections] = useState<Map<string, ProjectionResponse>>(
    new Map()
  );
  const [projectionErrors, setProjectionErrors] = useState<Map<string, string>>(
    new Map()
  );
  const { notify } = useToast();

  const loadGoals = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setState({ status: "loading" });
    }

    try {
      const goals = await fetchGoals();
      setState({ status: "ready", goals });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Saved goals could not be loaded. Please try again.";
      setState({ status: "error", message });
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    fetchGoals()
      .then((goals) => {
        if (isCurrent) {
          setState({ status: "ready", goals });
        }
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Saved goals could not be loaded. Please try again.";

        if (isCurrent) {
          setState({ status: "error", message });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VIEW_PREFERENCE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (state.status !== "ready" || state.goals.length === 0) {
      return;
    }

    let isCurrent = true;

    Promise.allSettled(
      state.goals.map((goal) => fetchGoalProjection(goal.id))
    ).then((results) => {
      if (!isCurrent) {
        return;
      }

      const nextProjections = new Map<string, ProjectionResponse>();
      const nextErrors = new Map<string, string>();

      results.forEach((result, index) => {
        const goal = state.goals[index];

        if (!goal) {
          return;
        }

        if (result.status === "fulfilled") {
          nextProjections.set(goal.id, result.value);
        } else {
          const message =
            result.reason instanceof Error
              ? result.reason.message
              : "Projection could not be loaded.";
          nextErrors.set(goal.id, message);
        }
      });

      setProjections(nextProjections);
      setProjectionErrors(nextErrors);

      if (nextErrors.size > 0) {
        notify({
          tone: "error",
          title: "Projection summaries incomplete",
          message: `${nextErrors.size} projection request${
            nextErrors.size === 1 ? "" : "s"
          } could not be loaded.`
        });
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [notify, state]);

  const areProjectionsLoading = useMemo(() => {
    if (state.status !== "ready" || state.goals.length === 0) {
      return false;
    }

    const loadedCount = state.goals.filter(
      (goal) => projections.has(goal.id) || projectionErrors.has(goal.id)
    ).length;

    return loadedCount < state.goals.length;
  }, [projectionErrors, projections, state]);

  const visibleGoals = useMemo(() => {
    if (state.status !== "ready") {
      return [];
    }

    return sortGoals(
      filterGoalsByStatus(
        searchGoals(state.goals, searchTerm),
        statusFilter,
        projections
      ),
      sortKey
    );
  }, [projections, searchTerm, sortKey, state, statusFilter]);

  const summary = useMemo(() => {
    if (state.status !== "ready") {
      return undefined;
    }

    return summarizeGoals(state.goals, projections);
  }, [projections, state]);

  const availableStatuses = useMemo<GoalStatus[]>(() => {
    if (state.status !== "ready") {
      return [];
    }

    const statuses = new Set<GoalStatus>();

    state.goals.forEach((goal) => {
      const projection = projections.get(goal.id);

      if (projection) {
        statuses.add(getGoalStatus(goal, projection));
      }
    });

    return ["on-track", "ahead", "at-risk"].filter((status) =>
      statuses.has(status as GoalStatus)
    ) as GoalStatus[];
  }, [projections, state]);

  return (
    <main className="page-shell goals-page">
      <PageHero
        actions={
          <>
            <Link className="button button-primary" href="/goals/new">
              Create goal
            </Link>
            <Link className="button button-secondary" href="/calculator">
              Try calculator
            </Link>
          </>
        }
        description="Track named goals, compare saved assumptions, and review projection outcomes returned by the InvestWise API."
        eyebrow="Saved goals"
        title="Your financial goals"
      />

      {state.status === "loading" ? (
        <LoadingState
          message="Fetching saved goals from the InvestWise API."
          title="Loading saved goals"
        />
      ) : null}

      {state.status === "error" ? (
        <ErrorState
          message={state.message}
          onRetry={loadGoals}
          title="Saved goals are unavailable"
        />
      ) : null}

      {state.status === "ready" && state.goals.length === 0 ? (
        <EmptyState
          action={
            <div className="hero-actions">
              <Link className="button button-primary" href="/goals/new">
                Create goal
              </Link>
              <Link className="button button-secondary" href="/calculator">
                Try calculator
              </Link>
            </div>
          }
          message="Create a goal to save assumptions and revisit the calculated projection later."
          title="No goals saved yet"
        />
      ) : null}

      {state.status === "ready" && state.goals.length > 0 ? (
        <>
          {summary ? (
            <section className="summary-section" aria-label="Goals summary">
              <StatCard
                label="Total goals"
                value={String(summary.goalCount)}
                detail={`${projections.size}/${state.goals.length} projections loaded`}
              />
              <StatCard
                label="Combined target"
                value={formatCurrency(summary.combinedTargetAmount)}
              />
              <StatCard
                label="Current savings"
                value={formatCurrency(summary.combinedCurrentSavings)}
                detail={`${formatProgressPercent(
                  summary.overallProgressPercentage
                )} overall progress`}
                tone="success"
              />
              <StatCard
                label="Projected balance"
                value={formatCurrency(summary.combinedProjectedBalance)}
                detail={
                  areProjectionsLoading
                    ? "Still loading projection totals"
                    : "From loaded backend projections"
                }
              />
              <StatCard
                label="Remaining"
                value={formatCurrency(summary.totalRemainingAmount)}
                tone="warning"
              />
              <div className="summary-progress-card">
                <span>Overall saved progress</span>
                <strong>
                  {formatProgressPercent(summary.overallProgressPercentage)}
                </strong>
                <GoalProgressBar
                  goal={{
                    ...state.goals[0],
                    current_amount: String(summary.combinedCurrentSavings),
                    target_amount: String(summary.combinedTargetAmount)
                  }}
                />
              </div>
            </section>
          ) : null}

          {areProjectionsLoading ? (
            <div className="projection-loading-row">
              <SkeletonCard count={2} />
            </div>
          ) : null}

          <section className="goals-toolbar" aria-label="Goals tools">
            <SearchInput value={searchTerm} onChange={setSearchTerm} />
            <GoalFilters
              availableStatuses={availableStatuses}
              onSortChange={setSortKey}
              onStatusChange={setStatusFilter}
              sortKey={sortKey}
              status={statusFilter}
            />
            <ViewToggle onChange={setViewMode} value={viewMode} />
          </section>

          {visibleGoals.length === 0 ? (
            <section className="state-panel" aria-live="polite">
              <p className="state-kicker">No matches</p>
              <h2>No goals match your search</h2>
              <p>Try a different search term, sort, or status filter.</p>
            </section>
          ) : viewMode === "cards" ? (
            <section className="goals-grid" aria-label="Saved goals">
              {visibleGoals.map((goal) => (
                <GoalCard
                  goal={goal}
                  key={goal.id}
                  projection={projections.get(goal.id)}
                  projectionError={projectionErrors.get(goal.id)}
                />
              ))}
            </section>
          ) : (
            <section className="goals-list" aria-label="Saved goals">
              {visibleGoals.map((goal) => (
                <GoalListRow
                  goal={goal}
                  key={goal.id}
                  projection={projections.get(goal.id)}
                  projectionError={projectionErrors.get(goal.id)}
                />
              ))}
            </section>
          )}
        </>
      ) : null}
    </main>
  );
}

function getInitialViewMode(): GoalsViewMode {
  if (typeof window === "undefined") {
    return "cards";
  }

  const savedPreference = window.localStorage.getItem(VIEW_PREFERENCE_KEY);
  return savedPreference === "list" ? "list" : "cards";
}
