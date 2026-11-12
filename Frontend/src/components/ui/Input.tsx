import type { InputHTMLAttributes } from "react";

type InputProps = {
  label: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        id={inputId}
        className={[
          "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none",
          "focus:border-blue-600 focus:ring-2 focus:ring-blue-100",
          error ? "border-red-500 focus:ring-red-100" : "",
          className,
        ].join("")}
        {...props}
      />

      {error && (
        <span className="mt-1 block text-sm text-red-600">{error}</span>
      )}
    </label>
  );
}

export default Input;
