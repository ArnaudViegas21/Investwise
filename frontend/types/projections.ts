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

export type ProjectionRequest = {
  initial_amount: string;
  monthly_contribution: string;
  annual_return_rate: string;
  years: number;
};

export type YearlyBalance = {
  year: number;
  balance: string;
};

export type ProjectionResponse = {
  projected_balance: string;
  total_contributions: string;
  estimated_growth: string;
  yearly_balances: YearlyBalance[];
  disclaimer: string;
};

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
      projection: ProjectionResponse;
    }
  | {
      status: "error";
      submittedValues: ProjectionFormValues;
      message: string;
    };
