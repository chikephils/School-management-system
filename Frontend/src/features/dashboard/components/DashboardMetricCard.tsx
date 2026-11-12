import type { LucideIcon } from "lucide-react";
import Card from "../../../components/ui/Card";

type MetricTone = "blue" | "emerald" | "amber" | "rose";

type DashboardMetricCardProps = {
  title: string;
  value: string | number | undefined;
  description: string;
  icon: LucideIcon;
  tone?: MetricTone;
};

const toneClasses: Record<MetricTone, string> = {
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
};

function DashboardMetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "blue",
}: DashboardMetricCardProps) {
  return (
    <Card className="h-full min-h-36">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        <div className={`shrink-0 rounded-md p-2 ${toneClasses[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

export default DashboardMetricCard;
