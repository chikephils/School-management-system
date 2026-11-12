import type { HTMLAttributes, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={[
        "rounded-lg border border-slate-100 bg-white p-8 shadow-sm",
        className,
      ].join("")}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
