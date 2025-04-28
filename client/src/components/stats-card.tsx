import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "primary" | "success" | "warning" | "error" | "info" | "default";
}

export default function StatsCard({ title, value, icon: Icon, color = "primary" }: StatsCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400";
      case "success":
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400";
      case "warning":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400";
      case "error":
        return "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400";
      case "info":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", getColorClasses())}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
