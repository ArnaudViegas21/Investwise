"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GoalForm, {
  toCreateGoalRequest,
  type GoalFormValues
} from "@/components/GoalForm";
import PageHero from "@/components/PageHero";
import { createGoal } from "@/lib/api/goals";

const REDIRECT_DELAY_MS = 700;

export default function NewGoalPage() {
  return (
    <Suspense fallback={null}>
      <NewGoalPageContent />
    </Suspense>
  );
}

function NewGoalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialValues = useMemo(
    () => getInitialGoalValues(searchParams),
    [searchParams]
  );

  async function handleCreate(values: GoalFormValues) {
    const createdGoal = await createGoal(toCreateGoalRequest(values));

    window.setTimeout(() => {
      router.push(`/goals/${createdGoal.id}?notice=goal-created`);
    }, REDIRECT_DELAY_MS);

    return createdGoal;
  }

  return (
    <main className="page-shell narrow-page">
      <PageHero
        description="Add a named objective and review the projection assumptions before saving."
        eyebrow="Create goal"
        title="Save a financial goal"
      />

      <section className="panel">
        <GoalForm
          initialValues={initialValues}
          onSubmit={handleCreate}
          pendingLabel="Creating goal..."
          submitLabel="Create goal"
          successMessage="Goal created. Opening details..."
        />
      </section>
    </main>
  );
}

function getInitialGoalValues(searchParams: {
  get: (name: string) => string | null;
}): GoalFormValues {
  return {
    name: searchParams.get("name") ?? "",
    targetAmount: searchParams.get("targetAmount") ?? "",
    currentAmount: searchParams.get("currentAmount") ?? "0",
    monthlyContribution: searchParams.get("monthlyContribution") ?? "0",
    annualReturnRate: searchParams.get("annualReturnRate") ?? "7",
    years: searchParams.get("years") ?? "10"
  };
}
