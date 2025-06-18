"use client";

import { useState, useEffect } from "react";

import { X } from "lucide-react";

import { cn } from "lib/utils";
import { handleError } from "lib/ai/handler";
import { CustomError } from "lib/errors";

interface ErrorToast {
  error: CustomError;
  closed: boolean;
}

interface ErrorMessageProps {
  error: CustomError;
  details: Record<string, any>;
}

export function ErrorMessage({ error, details }: ErrorMessageProps) {
  const [errors, setErrors] = useState<ErrorToast[]>([]);

  const handleClose = (index: number) => {
    setErrors(
      errors.map((error, i) => {
        if (i === index) {
          return { ...error, closed: true };
        }
        return error;
      })
    );
    setTimeout(() => {
      setErrors(errors.filter((error, i) => i !== index));
    }, 300);
  };

  useEffect(() => {
    setErrors([{ error, closed: false }, ...errors]);
  }, [error]);

  const handledError = handleError(error, details);

  return (
    <ul className="relative">
      {errors.map((e, index) => (
        <li
          className={cn(
            "flex items-center overflow-hidden transition-all duration-300 justify-between px-4 py-4 mx-4 text-sm border rounded-lg bg-destructive/10 border-destructive/20 text-destructive",
            e.closed
              ? "opacity-0 max-h-0 mt-0 mb-0"
              : "opacity-100 max-h-24 mt-2 mb-2"
          )}
          key={index + e.error.message}
        >
          <span>{handledError}</span>
          <button
            onClick={() => handleClose(index)}
            className="flex items-center justify-center w-5 h-5 ml-2 transition-colors rounded-full hover:bg-destructive/20"
          >
            <X className="w-3 h-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}
