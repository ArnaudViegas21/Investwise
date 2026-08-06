"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import GoalForm, {
  financialGoalToFormValues,
  toChangedGoalRequest,
  type GoalFormValues
} from "@/components/GoalForm";
import { ErrorState, LoadingState } from "@/components/GoalStates";
import PageHero from "@/components/PageHero";
import { fetchGoal, updateGoal, type FinancialGoal } from "@/lib/api/goals";

const REDIRECT_DELAY_MS = 700;

type EditGoalState =
  | { status: "loading" }
  | { status: "ready"; goal: FinancialGoal; formValues: GoalFormValues }
  | { status: "error"; message: string };

export default function EditGoalPage() {
  const params = useParams<{ goalId: string }>();
  const router = useRouter();
  const goalId = params.goalId;
  const [state, setState] = useState<EditGoalState>({ status: "loading" });

  const loadGoal = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setState({ status: "loading" });
    }

    try {
      const goal = await fetchGoal(goalId);
      setState({
        status: "ready",
        goal,
        formValues: financialGoalToFormValues(goal)
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The goal could not be loaded for editing.";
      setState({ status: "error", message });
    }
  }, [goalId]);

  useEffect(() => {
    let isCurrent = true;

    fetchGoal(goalId)
      .then((goal) => {
        if (isCurrent) {
          setState({
            status: "ready",
            goal,
            formValues: financialGoalToFormValues(goal)
          });
        }
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "The goal could not be loaded for editing.";

        if (isCurrent) {
          setState({ status: "error", message });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [goalId]);

  async function handleUpdate(values: GoalFormValues) {
    if (state.status !== "ready") {
      throw new Error("The goal is still loading.");
    }

    const updateRequest = toChangedGoalRequest(state.formValues, values);

    if (Object.keys(updateRequest).length === 0) {
      window.setTimeout(() => {
        router.push(`/goals/${state.goal.id}`);
      }, REDIRECT_DELAY_MS);
      return "unchanged" as const;
    }

    const updatedGoal = await updateGoal(state.goal.id, updateRequest);

    window.setTimeout(() => {
      router.push(`/goals/${updatedGoal.id}?notice=goal-updated`);
    }, REDIRECT_DELAY_MS);

    return updatedGoal;
  }

  return (
    <main className="page-shell narrow-page">
      {state.status === "loading" ? (
        <LoadingState
          message="Loading current goal values."
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
            description="Update saved assumptions and return to the refreshed details."
            eyebrow="Edit goal"
            title={state.goal.name}
          />

          <section className="panel">
            <GoalForm
              initialValues={state.formValues}
              onSubmit={handleUpdate}
              pendingLabel="Saving changes..."
              submitLabel="Save changes"
              successMessage="Goal updated. Returning to details..."
            />
          </section>

          <p className="back-link">
            <Link href={`/goals/${state.goal.id}`}>Back to details</Link>
          </p>
        </>
      ) : null}
    </main>
  );
}
