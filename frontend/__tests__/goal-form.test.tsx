import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DeleteGoalDialog from "@/components/DeleteGoalDialog";
import {
  validateGoalForm,
  type GoalFormValues
} from "@/components/GoalForm";

const validValues: GoalFormValues = {
  name: "Retirement bridge",
  targetAmount: "100000",
  currentAmount: "10000",
  monthlyContribution: "300",
  annualReturnRate: "7",
  years: "10"
};

describe("goal form validation", () => {
  it("reports invalid goal values", () => {
    const errors = validateGoalForm({
      name: "",
      targetAmount: "0",
      currentAmount: "-1",
      monthlyContribution: "-1",
      annualReturnRate: "-101",
      years: "81"
    });

    expect(errors).toEqual({
      name: "Name is required.",
      targetAmount: "Target amount must be greater than zero.",
      currentAmount: "Current amount cannot be negative.",
      monthlyContribution: "Monthly contribution cannot be negative.",
      annualReturnRate: "Annual return cannot be below -100%.",
      years: "Years must be between 1 and 80."
    });
  });

  it("accepts valid goal values", () => {
    expect(validateGoalForm(validValues)).toEqual({});
  });
});

describe("delete confirmation", () => {
  it("names the goal and prevents repeated submission while deleting", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteGoalDialog
        goalName="Retirement bridge"
        isDeleting
        isOpen
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    expect(
      screen.getByRole("dialog", { name: "Delete Retirement bridge?" })
    ).toBeInTheDocument();

    const deleteButton = screen.getByRole("button", { name: "Deleting..." });
    expect(deleteButton).toBeDisabled();

    fireEvent.click(deleteButton);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("closes with Escape for keyboard users", () => {
    const onCancel = vi.fn();

    render(
      <DeleteGoalDialog
        goalName="Retirement bridge"
        isDeleting={false}
        isOpen
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
