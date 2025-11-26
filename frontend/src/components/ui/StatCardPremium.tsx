import React from "react";
import MiniSparkline from "./MiniSparkline";

type Props = {
  title: string;
  value: React.ReactNode;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  trend?: "up" | "down";
  trendValue?: string;
  chart?: number[];
};

export const StatCardPremium: React.FC<Props> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  chart,
}) => {
  return (
    <div className="stat glass-premium glass-hover p-4 rounded-xl">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-6 h-6" />
          </div>
        )}

        <div className="flex-1">
          <div className="text-sm text-base-content/60 font-medium">
            {title}
          </div>
          <div className="text-2xl font-bold mt-1 flex items-baseline gap-2">
            {value}
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend === "up" ? "text-success" : "text-error"
                }`}
              >
                {trend === "up" ? "↗" : "↘"} {trendValue}
              </span>
            )}
          </div>
          {chart && (
            <div className="mt-2">
              <MiniSparkline data={chart} height={40} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCardPremium;
