import type { ReactNode, SelectHTMLAttributes } from "react";

type SelectProps = {
  label: string;
  error?: string;
  children: ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>;

function Select({
  label,
  error,
  children,
  className = "",
  ...props
}: SelectProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {" "}
        {label}
      </span>

      <select
        className={[
          "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none",
          "focus:border-blue-600 focus:ring-2 focus:ring-blue-100",
          "disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500",
          error ? "border-red-500 focus:ring-red-100" : "",
          className,
        ].join("")}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span className="mt-1 block text-sm text-red-600">{error}</span>
      )}
    </label>
  );
}

export default Select;
