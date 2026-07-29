export type ProjectionFormValues = {
  initialInvestment: number;
  monthlyContribution: number;
  annualReturn: number;
  years: number;
};

export type ProjectionFieldName = keyof ProjectionFormValues;

export type ProjectionValidationErrors = Partial<
  Record<ProjectionFieldName, string>
>;

export type ProjectionResultState =
  | {
      status: "idle";
    }
  | {
      status: "loading";
      submittedValues: ProjectionFormValues;
    }
  | {
      status: "ready";
      submittedValues: ProjectionFormValues;
    };
