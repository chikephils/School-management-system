import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  isLoading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue-700 text-white hover:bg-blue-800",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

function Button({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition",
        "disabled::cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      ].join(" ")}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Please wait..." : children}
    </button>
  );
}

export default Button;
