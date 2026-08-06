"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DeleteGoalDialog from "@/components/DeleteGoalDialog";
import GoalSummary from "@/components/GoalSummary";
import { ErrorState, LoadingState } from "@/components/GoalStates";
import GoalStatusBadge from "@/components/GoalStatusBadge";
import PageHero from "@/components/PageHero";
import ProjectionSummary from "@/components/ProjectionSummary";
import {
  deleteGoal,
  fetchGoal,
  fetchGoalProjection,
  type FinancialGoal,
  type ProjectionResponse
} from "@/lib/api/goals";
import { getGoalStatus } from "@/lib/goal-analytics";

type GoalDetailsState =
  | { status: "loading" }
  | { status: "ready"; goal: FinancialGoal; projection: ProjectionResponse }
  | { status: "error"; message: string };

export default function GoalDetailsPage() {
  const params = useParams<{ goalId: string }>();
  const router = useRouter();
  const goalId = params.goalId;
  const [state, setState] = useState<GoalDetailsState>({ status: "loading" });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  const loadGoal = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setState({ status: "loading" });
    }

    try {
      const [goal, projection] = await Promise.all([
        fetchGoal(goalId),
        fetchGoalProjection(goalId)
      ]);
      setState({ status: "ready", goal, projection });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The goal could not be loaded. Please try again.";
      setState({ status: "error", message });
    }
  }, [goalId]);

  useEffect(() => {
    let isCurrent = true;

    Promise.all([fetchGoal(goalId), fetchGoalProjection(goalId)])
      .then(([goal, projection]) => {
        if (isCurrent) {
          setState({ status: "ready", goal, projection });
        }
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "The goal could not be loaded. Please try again.";

        if (isCurrent) {
          setState({ status: "error", message });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [goalId]);

  async function handleDelete() {
    if (state.status !== "ready" || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(undefined);

    try {
      await deleteGoal(state.goal.id);
      router.push("/goals?notice=goal-deleted");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The goal could not be deleted. Please try again.";
      setDeleteError(message);
      setIsDeleting(false);
    }
  }

  return (
    <main className="page-shell goals-page">
      {state.status === "loading" ? (
        <LoadingState
          message="Fetching the saved goal and its projection."
          title="Loading goal"
        />
      ) : null}

      {state.status === "error" ? (
        <ErrorState
          message={state.message}
          onRetry={loadGoal}
          title="Goal unavailable"
        />
      ) : null}

      {state.status === "ready" ? (
        <>
          <PageHero
            actions={
              <>
                <Link
                  className="button button-secondary"
                  href={`/goals/${state.goal.id}/edit`}
                >
                  Edit
                </Link>
                <button
                  className="button button-danger"
                  onClick={() => setIsDeleteOpen(true)}
                  type="button"
                >
                  Delete
                </button>
              </>
            }
            description="These values are saved assumptions. Projection values are returned by the backend."
            eyebrow="Goal details"
            title={state.goal.name}
          >
            <div className="hero-status-row">
              <GoalStatusBadge
                status={getGoalStatus(state.goal, state.projection)}
              />
              <Link
                className="back-link"
                href="/goals"
              >
                Back to goals
              </Link>
            </div>
          </PageHero>

          <div className="detail-grid">
            <GoalSummary goal={state.goal} />
            <ProjectionSummary
              goal={state.goal}
              projection={state.projection}
            />
          </div>

          <DeleteGoalDialog
            errorMessage={deleteError}
            goalName={state.goal.name}
            isDeleting={isDeleting}
            isOpen={isDeleteOpen}
            onCancel={() => {
              setIsDeleteOpen(false);
              setDeleteError(undefined);
            }}
            onConfirm={handleDelete}
          />
        </>
      ) : null}
    </main>
  );
}
