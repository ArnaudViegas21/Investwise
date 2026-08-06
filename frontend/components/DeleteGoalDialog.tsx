"use client";

import { useEffect, useRef } from "react";

type DeleteGoalDialogProps = {
  goalName: string;
  isOpen: boolean;
  isDeleting: boolean;
  errorMessage?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteGoalDialog({
  goalName,
  isOpen,
  isDeleting,
  errorMessage,
  onCancel,
  onConfirm
}: DeleteGoalDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      cancelButtonRef.current?.focus();
    }

    return () => {
      if (!isOpen) {
        return;
      }

      previousActiveElementRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        onCancel();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])"
        )
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleting, isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onCancel();
        }
      }}
      role="presentation"
    >
      <section
        aria-describedby="delete-goal-description"
        aria-labelledby="delete-goal-title"
        aria-modal="true"
        className="dialog"
        ref={dialogRef}
        role="dialog"
      >
        <h2 id="delete-goal-title">Delete {goalName}?</h2>
        <p id="delete-goal-description">
          This will permanently remove the saved goal. The calculator remains
          available for new projections.
        </p>

        {errorMessage ? (
          <p className="form-message form-message-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="dialog-actions">
          <button
            className="button button-secondary"
            disabled={isDeleting}
            onClick={onCancel}
            ref={cancelButtonRef}
            type="button"
          >
            Cancel
          </button>
          <button
            className="button button-danger"
            disabled={isDeleting}
            onClick={onConfirm}
            type="button"
          >
            {isDeleting ? "Deleting..." : "Delete goal"}
          </button>
        </div>
      </section>
    </div>
  );
}
