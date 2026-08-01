import type {
  ProjectionFormValues,
  ProjectionRequest,
  ProjectionResponse,
  YearlyBalance
} from "@/types/projections";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

type ApiErrorPayload = {
  detail?: unknown;
};

export class ProjectionApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectionApiError";
  }
}

export async function createProjection(
  values: ProjectionFormValues
): Promise<ProjectionResponse> {
  const request = toProjectionRequest(values);
  const apiBaseUrl = getApiBaseUrl();

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/v1/projections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });
  } catch {
    throw new ProjectionApiError(
      `Could not reach the InvestWise API. Make sure the FastAPI server is running at ${apiBaseUrl}.`
    );
  }

  const payload = await readJson(response);

  if (!response.ok) {
    throw new ProjectionApiError(getErrorMessage(response, payload));
  }

  if (!isProjectionResponse(payload)) {
    throw new ProjectionApiError(
      "The projection response was not in the expected format."
    );
  }

  return payload;
}

function toProjectionRequest(values: ProjectionFormValues): ProjectionRequest {
  return {
    initial_amount: String(values.initialInvestment),
    monthly_contribution: String(values.monthlyContribution),
    annual_return_rate: String(values.annualReturn),
    years: values.years
  };
}

function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_API_BASE_URL
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    const payload: unknown = await response.json();
    return payload;
  } catch {
    return undefined;
  }
}

function getErrorMessage(response: Response, payload: unknown): string {
  const detail = getApiErrorDetail(payload);

  if (detail) {
    return detail;
  }

  if (response.status === 422) {
    return "The API could not validate the projection request.";
  }

  return `The projection request was not successful. The API returned HTTP ${response.status}.`;
}

function getApiErrorDetail(payload: unknown): string | undefined {
  if (!isObject(payload)) {
    return undefined;
  }

  const errorPayload: ApiErrorPayload = payload;

  if (typeof errorPayload.detail === "string") {
    return errorPayload.detail;
  }

  if (Array.isArray(errorPayload.detail)) {
    const messages = errorPayload.detail
      .map((entry) => getValidationMessage(entry))
      .filter((message): message is string => Boolean(message));

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return undefined;
}

function getValidationMessage(entry: unknown): string | undefined {
  if (!isObject(entry) || typeof entry.msg !== "string") {
    return undefined;
  }

  if (Array.isArray(entry.loc)) {
    const fieldName = entry.loc
      .filter((part): part is string => typeof part === "string")
      .at(-1);

    if (fieldName) {
      return `${fieldName}: ${entry.msg}`;
    }
  }

  return entry.msg;
}

function isProjectionResponse(payload: unknown): payload is ProjectionResponse {
  if (!isObject(payload)) {
    return false;
  }

  return (
    typeof payload.projected_balance === "string" &&
    typeof payload.total_contributions === "string" &&
    typeof payload.estimated_growth === "string" &&
    typeof payload.disclaimer === "string" &&
    Array.isArray(payload.yearly_balances) &&
    payload.yearly_balances.every(isYearlyBalance)
  );
}

function isYearlyBalance(value: unknown): value is YearlyBalance {
  return (
    isObject(value) &&
    typeof value.year === "number" &&
    typeof value.balance === "string"
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
