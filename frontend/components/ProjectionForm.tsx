"use client";

import { useMemo, useState } from "react";
import ProjectionResults from "@/components/ProjectionResults";
import type {
  ProjectionFieldName,
  ProjectionFormValues,
  ProjectionResultState,
  ProjectionValidationErrors
} from "@/types/projections";

const initialValues: ProjectionFormValues = {
  initialInvestment: 5000,
  monthlyContribution: 250,
  annualReturn: 7,
  years: 10
};

type NumericFieldConfig = {
  name: ProjectionFieldName;
  label: string;
  min?: number;
  max?: number;
  step?: number;
};

const fieldConfigs: NumericFieldConfig[] = [
  {
    name: "initialInvestment",
    label: "Initial investment",
    min: 0,
    step: 100
  },
  {
    name: "monthlyContribution",
    label: "Monthly contribution",
    min: 0,
    step: 25
  },
  {
    name: "annualReturn",
    label: "Estimated annual return percentage",
    min: -100,
    step: 0.1
  },
  {
    name: "years",
    label: "Investment period in years",
    min: 1,
    max: 80,
    step: 1
  }
];

function validateProjectionForm(
  values: ProjectionFormValues
): ProjectionValidationErrors {
  const errors: ProjectionValidationErrors = {};

  if (values.initialInvestment < 0) {
    errors.initialInvestment = "Initial investment cannot be negative.";
  }

  if (values.monthlyContribution < 0) {
    errors.monthlyContribution = "Monthly contribution cannot be negative.";
  }

  if (values.annualReturn < -100) {
    errors.annualReturn = "Annual return cannot be below -100%.";
  }

  if (values.years < 1 || values.years > 80) {
    errors.years = "Years must be between 1 and 80.";
  }

  return errors;
}

function hasValidationErrors(errors: ProjectionValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export default function ProjectionForm() {
  const [values, setValues] = useState<ProjectionFormValues>(initialValues);
  const [resultState, setResultState] = useState<ProjectionResultState>({
    status: "idle"
  });

  const validationErrors = useMemo(
    () => validateProjectionForm(values),
    [values]
  );
  const isInvalid = hasValidationErrors(validationErrors);

  function handleValueChange(name: ProjectionFieldName, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [name]: Number(value)
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const currentErrors = validateProjectionForm(values);

    if (hasValidationErrors(currentErrors)) {
      return;
    }

    const submittedValues = { ...values };
    setResultState({
      status: "ready",
      submittedValues
    });
  }

  return (
    <div className="calculator-grid">
      <form className="projection-form" onSubmit={handleSubmit} noValidate>
        {fieldConfigs.map((field) => {
          const inputId = `projection-${field.name}`;
          const errorId = `${inputId}-error`;
          const errorMessage = validationErrors[field.name];

          return (
            <div className="form-field" key={field.name}>
              <label htmlFor={inputId}>{field.label}</label>
              <input
                aria-describedby={errorMessage ? errorId : undefined}
                aria-invalid={Boolean(errorMessage)}
                id={inputId}
                max={field.max}
                min={field.min}
                name={field.name}
                onChange={(event) =>
                  handleValueChange(field.name, event.target.value)
                }
                step={field.step}
                type="number"
                value={values[field.name]}
              />
              <p className="field-error" id={errorId}>
                {errorMessage ?? ""}
              </p>
            </div>
          );
        })}

        <button className="button button-primary" disabled={isInvalid} type="submit">
          Prepare projection
        </button>
      </form>

      <ProjectionResults resultState={resultState} />
    </div>
  );
}
