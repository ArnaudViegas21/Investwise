const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

export type FinancialGoal = {
  id: string;
  name: string;
  target_amount: string;
  current_amount: string;
  monthly_contribution: string;
  annual_return_rate: string;
  years: number;
  created_at: string;
  updated_at: string;
};

export type CreateFinancialGoalRequest = {
  name: string;
  target_amount: string;
  current_amount: string;
  monthly_contribution: string;
  annual_return_rate: string;
  years: number;
};

export type UpdateFinancialGoalRequest =
  Partial<CreateFinancialGoalRequest>;

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

export type ApiErrorKind =
  | "network"
  | "not_found"
  | "validation"
  | "database_unavailable"
  | "server"
  | "unexpected";

export type ApiErrorResponse = {
  detail?: unknown;
  status?: unknown;
};

export class GoalsApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(message: string, kind: ApiErrorKind, status?: number) {
    super(message);
    this.name = "GoalsApiError";
    this.kind = kind;
    this.status = status;
  }
}

export async function fetchGoals(): Promise<FinancialGoal[]> {
  const payload = await requestJson("/api/v1/goals", { method: "GET" });

  if (!Array.isArray(payload) || !payload.every(isFinancialGoal)) {
    throw new GoalsApiError(
      "The saved goals response was not in the expected format.",
      "unexpected"
    );
  }

  return payload;
}

export async function createGoal(
  request: CreateFinancialGoalRequest
): Promise<FinancialGoal> {
  const payload = await requestJson("/api/v1/goals", {
    method: "POST",
    body: JSON.stringify(request)
  });

  if (!isFinancialGoal(payload)) {
    throw new GoalsApiError(
      "The created goal response was not in the expected format.",
      "unexpected"
    );
  }

  return payload;
}

export async function fetchGoal(goalId: string): Promise<FinancialGoal> {
  const payload = await requestJson(`/api/v1/goals/${goalId}`, {
    method: "GET"
  });

  if (!isFinancialGoal(payload)) {
    throw new GoalsApiError(
      "The goal response was not in the expected format.",
      "unexpected"
    );
  }

  return payload;
}

export async function updateGoal(
  goalId: string,
  request: UpdateFinancialGoalRequest
): Promise<FinancialGoal> {
  const payload = await requestJson(`/api/v1/goals/${goalId}`, {
    method: "PATCH",
    body: JSON.stringify(request)
  });

  if (!isFinancialGoal(payload)) {
    throw new GoalsApiError(
      "The updated goal response was not in the expected format.",
      "unexpected"
    );
  }

  return payload;
}

export async function deleteGoal(goalId: string): Promise<void> {
  await requestJson(`/api/v1/goals/${goalId}`, { method: "DELETE" });
}

export async function fetchGoalProjection(
  goalId: string
): Promise<ProjectionResponse> {
  const payload = await requestJson(`/api/v1/goals/${goalId}/projection`, {
    method: "GET"
  });

  if (!isProjectionResponse(payload)) {
    throw new GoalsApiError(
      "The projection response was not in the expected format.",
      "unexpected"
    );
  }

  return payload;
}

async function requestJson(
  path: string,
  init: RequestInit
): Promise<unknown> {
  const apiBaseUrl = getApiBaseUrl();
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers
      }
    });
  } catch {
    throw new GoalsApiError(
      `Could not reach the InvestWise API. Make sure the FastAPI server is running at ${apiBaseUrl}.`,
      "network"
    );
  }

  if (response.status === 204) {
    return undefined;
  }

  const payload = await readJson(response);

  if (!response.ok) {
    throw createApiError(response, payload);
  }

  return payload;
}

function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_API_BASE_URL
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function createApiError(response: Response, payload: unknown): GoalsApiError {
  if (response.status === 404) {
    return new GoalsApiError(
      "We could not find that saved goal.",
      "not_found",
      response.status
    );
  }

  if (response.status === 422) {
    return new GoalsApiError(
      getValidationMessage(payload),
      "validation",
      response.status
    );
  }

  if (response.status === 503) {
    return new GoalsApiError(
      "The database is temporarily unavailable. Please try again in a moment.",
      "database_unavailable",
      response.status
    );
  }

  if (response.status >= 500) {
    return new GoalsApiError(
      "The server could not complete the request. Please try again.",
      "server",
      response.status
    );
  }

  return new GoalsApiError(
    "The request could not be completed. Please review the details and try again.",
    "unexpected",
    response.status
  );
}

function getValidationMessage(payload: unknown): string {
  const fallback = "Some goal details were not accepted. Please review the form.";

  if (!isObject(payload)) {
    return fallback;
  }

  const errorPayload: ApiErrorResponse = payload;

  if (typeof errorPayload.detail === "string") {
    return errorPayload.detail;
  }

  if (!Array.isArray(errorPayload.detail)) {
    return fallback;
  }

  const messages = errorPayload.detail
    .map((entry) => {
      if (!isObject(entry) || typeof entry.msg !== "string") {
        return undefined;
      }

      return entry.msg;
    })
    .filter((message): message is string => Boolean(message));

  return messages.length > 0 ? messages.join(" ") : fallback;
}

function isFinancialGoal(payload: unknown): payload is FinancialGoal {
  return (
    isObject(payload) &&
    typeof payload.id === "string" &&
    typeof payload.name === "string" &&
    typeof payload.target_amount === "string" &&
    typeof payload.current_amount === "string" &&
    typeof payload.monthly_contribution === "string" &&
    typeof payload.annual_return_rate === "string" &&
    typeof payload.years === "number" &&
    typeof payload.created_at === "string" &&
    typeof payload.updated_at === "string"
  );
}

function isProjectionResponse(payload: unknown): payload is ProjectionResponse {
  return (
    isObject(payload) &&
    typeof payload.projected_balance === "string" &&
    typeof payload.total_contributions === "string" &&
    typeof payload.estimated_growth === "string" &&
    typeof payload.disclaimer === "string" &&
    Array.isArray(payload.yearly_balances) &&
    payload.yearly_balances.every(isYearlyBalance)
  );
}

function isYearlyBalance(payload: unknown): payload is YearlyBalance {
  return (
    isObject(payload) &&
    typeof payload.year === "number" &&
    typeof payload.balance === "string"
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
