"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  CreateFinancialGoalRequest,
  FinancialGoal,
  UpdateFinancialGoalRequest
} from "@/lib/api/goals";
import { formatCurrency, formatPercent } from "@/lib/format";

export type GoalFormValues = {
  name: string;
  targetAmount: string;
  currentAmount: string;
  monthlyContribution: string;
  annualReturnRate: string;
  years: string;
};

export type GoalFieldName = keyof GoalFormValues;

export type GoalValidationErrors = Partial<Record<GoalFieldName, string>>;

type GoalFormProps = {
  initialValues?: GoalFormValues;
  submitLabel: string;
  pendingLabel: string;
  successMessage: string;
  onSubmit: (
    values: GoalFormValues
  ) => Promise<FinancialGoal | "unchanged">;
};

const defaultValues: GoalFormValues = {
  name: "",
  targetAmount: "",
  currentAmount: "0",
  monthlyContribution: "0",
  annualReturnRate: "7",
  years: "10"
};

const fieldConfigs: {
  name: GoalFieldName;
  label: string;
  helper: string;
  type: "text" | "number";
  section: "identity" | "assumptions";
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}[] = [
  {
    name: "name",
    label: "Goal name",
    helper: "Use a clear name you will recognize later.",
    type: "text",
    section: "identity"
  },
  {
    name: "targetAmount",
    label: "Target amount",
    helper: "The amount you would like this goal to reach.",
    type: "number",
    section: "identity",
    suffix: "EUR",
    min: 0.01,
    step: 100
  },
  {
    name: "currentAmount",
    label: "Current amount",
    helper: "Savings already allocated to this goal.",
    type: "number",
    section: "assumptions",
    suffix: "EUR",
    min: 0,
    step: 100
  },
  {
    name: "monthlyContribution",
    label: "Monthly contribution",
    helper: "Planned monthly additions used by the backend projection.",
    type: "number",
    section: "assumptions",
    suffix: "EUR",
    min: 0,
    step: 25
  },
  {
    name: "annualReturnRate",
    label: "Annual return percentage",
    helper: "A hypothetical annual return assumption.",
    type: "number",
    section: "assumptions",
    suffix: "%",
    min: -100,
    step: 0.1
  },
  {
    name: "years",
    label: "Years",
    helper: "Time horizon for the saved projection.",
    type: "number",
    section: "assumptions",
    min: 1,
    max: 80,
    step: 1
  }
];

export function financialGoalToFormValues(goal: FinancialGoal): GoalFormValues {
  return {
    name: goal.name,
    targetAmount: goal.target_amount,
    currentAmount: goal.current_amount,
    monthlyContribution: goal.monthly_contribution,
    annualReturnRate: goal.annual_return_rate,
    years: String(goal.years)
  };
}

export function validateGoalForm(values: GoalFormValues): GoalValidationErrors {
  const errors: GoalValidationErrors = {};
  const trimmedName = values.name.trim();

  if (!trimmedName) {
    errors.name = "Name is required.";
  } else if (trimmedName.length > 120) {
    errors.name = "Name must be 120 characters or fewer.";
  }

  const targetAmount = Number(values.targetAmount);
  const currentAmount = Number(values.currentAmount);
  const monthlyContribution = Number(values.monthlyContribution);
  const annualReturnRate = Number(values.annualReturnRate);
  const years = Number(values.years);

  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    errors.targetAmount = "Target amount must be greater than zero.";
  }

  if (!Number.isFinite(currentAmount) || currentAmount < 0) {
    errors.currentAmount = "Current amount cannot be negative.";
  }

  if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) {
    errors.monthlyContribution = "Monthly contribution cannot be negative.";
  }

  if (!Number.isFinite(annualReturnRate) || annualReturnRate < -100) {
    errors.annualReturnRate = "Annual return cannot be below -100%.";
  }

  if (!Number.isInteger(years) || years < 1 || years > 80) {
    errors.years = "Years must be between 1 and 80.";
  }

  return errors;
}

export function toCreateGoalRequest(
  values: GoalFormValues
): CreateFinancialGoalRequest {
  return {
    name: values.name.trim(),
    target_amount: values.targetAmount,
    current_amount: values.currentAmount,
    monthly_contribution: values.monthlyContribution,
    annual_return_rate: values.annualReturnRate,
    years: Number(values.years)
  };
}

export function toChangedGoalRequest(
  initialValues: GoalFormValues,
  values: GoalFormValues
): UpdateFinancialGoalRequest {
  const nextRequest = toCreateGoalRequest(values);
  const initialRequest = toCreateGoalRequest(initialValues);
  const update: UpdateFinancialGoalRequest = {};

  if (nextRequest.name !== initialRequest.name) {
    update.name = nextRequest.name;
  }

  if (nextRequest.target_amount !== initialRequest.target_amount) {
    update.target_amount = nextRequest.target_amount;
  }

  if (nextRequest.current_amount !== initialRequest.current_amount) {
    update.current_amount = nextRequest.current_amount;
  }

  if (nextRequest.monthly_contribution !== initialRequest.monthly_contribution) {
    update.monthly_contribution = nextRequest.monthly_contribution;
  }

  if (nextRequest.annual_return_rate !== initialRequest.annual_return_rate) {
    update.annual_return_rate = nextRequest.annual_return_rate;
  }

  if (nextRequest.years !== initialRequest.years) {
    update.years = nextRequest.years;
  }

  return update;
}

function hasValidationErrors(errors: GoalValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export default function GoalForm({
  initialValues = defaultValues,
  submitLabel,
  pendingLabel,
  successMessage,
  onSubmit
}: GoalFormProps) {
  const [values, setValues] = useState<GoalFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>();
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  const validationErrors = useMemo(() => validateGoalForm(values), [values]);
  const isInvalid = hasValidationErrors(validationErrors);
  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [initialValues, values]
  );

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty || isSubmitting) {
        return;
      }

      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, isSubmitting]);

  function handleChange(name: GoalFieldName, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const currentErrors = validateGoalForm(values);
    if (hasValidationErrors(currentErrors) || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setApiError(undefined);
    setStatusMessage(undefined);

    try {
      const result = await onSubmit(values);
      setStatusMessage(result === "unchanged" ? "No changes to save." : successMessage);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The goal could not be saved. Please try again.";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="goal-form" onSubmit={handleSubmit} noValidate>
      <fieldset>
        <legend>Goal identity</legend>
        {fieldConfigs
          .filter((field) => field.section === "identity")
          .map((field) => (
            <GoalField
              errorMessage={validationErrors[field.name]}
              field={field}
              key={field.name}
              onChange={handleChange}
              value={values[field.name]}
            />
          ))}
      </fieldset>

      <fieldset>
        <legend>Projection assumptions</legend>
        {fieldConfigs
          .filter((field) => field.section === "assumptions")
          .map((field) => (
            <GoalField
              errorMessage={validationErrors[field.name]}
              field={field}
              key={field.name}
              onChange={handleChange}
              value={values[field.name]}
            />
          ))}
      </fieldset>

      <aside className="form-preview" aria-label="Goal preview">
        <span>Live preview</span>
        <strong>{values.name.trim() || "Untitled goal"}</strong>
        <dl>
          <div>
            <dt>Target</dt>
            <dd>{formatCurrency(values.targetAmount)}</dd>
          </div>
          <div>
            <dt>Starting amount</dt>
            <dd>{formatCurrency(values.currentAmount)}</dd>
          </div>
          <div>
            <dt>Monthly contribution</dt>
            <dd>{formatCurrency(values.monthlyContribution)}</dd>
          </div>
          <div>
            <dt>Return assumption</dt>
            <dd>{formatPercent(values.annualReturnRate)}</dd>
          </div>
        </dl>
      </aside>

      <div className="form-actions">
        <button
          className="button button-primary"
          disabled={isInvalid || isSubmitting}
          type="submit"
        >
          {isSubmitting ? pendingLabel : submitLabel}
        </button>
      </div>

      <div aria-live="polite">
        {statusMessage ? (
          <p className="form-message form-message-success">{statusMessage}</p>
        ) : null}
        {apiError ? (
          <p className="form-message form-message-error">{apiError}</p>
        ) : null}
      </div>
    </form>
  );
}

type GoalFieldConfig = (typeof fieldConfigs)[number];

type GoalFieldProps = {
  field: GoalFieldConfig;
  value: string;
  errorMessage?: string;
  onChange: (name: GoalFieldName, value: string) => void;
};

function GoalField({ field, value, errorMessage, onChange }: GoalFieldProps) {
  const inputId = `goal-${field.name}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="form-field" key={field.name}>
      <label htmlFor={inputId}>
        {field.label}
        <span aria-hidden="true"> *</span>
      </label>
      <p className="field-helper" id={helperId}>
        {field.helper}
      </p>
      <div className="input-shell">
        <input
          aria-describedby={`${helperId} ${errorId}`}
          aria-invalid={Boolean(errorMessage)}
          id={inputId}
          max={field.max}
          maxLength={field.name === "name" ? 120 : undefined}
          min={field.min}
          name={field.name}
          onChange={(event) => onChange(field.name, event.target.value)}
          step={field.step}
          type={field.type}
          value={value}
        />
        {field.suffix ? <span>{field.suffix}</span> : null}
      </div>
      <p className="field-error" id={errorId}>
        {errorMessage ?? ""}
      </p>
    </div>
  );
}
