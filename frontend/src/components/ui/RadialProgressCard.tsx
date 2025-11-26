import React from "react";

type Props = {
  title: string;
  percentage: number;
  subtitle?: string;
  color?: string;
};

export const RadialProgressCard: React.FC<Props> = ({
  title,
  percentage,
  subtitle,
  color = "primary",
}) => {
  const r = 56;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="card glass-premium p-4 rounded-xl text-center">
      <div className="card-body items-center">
        <h3 className="card-title text-sm font-medium text-base-content/70">
          {title}
        </h3>
        <div className="relative w-36 h-36 my-4">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={r}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-base-300/20"
            />
            <circle
              cx="64"
              cy="64"
              r={r}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${offset}`}
              className={`text-${color} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-bold">
              {Math.round(percentage)}%
            </span>
            {subtitle && (
              <span className="text-xs text-base-content/60">{subtitle}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadialProgressCard;
