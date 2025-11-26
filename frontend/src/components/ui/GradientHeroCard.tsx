import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
};

export const GradientHeroCard: React.FC<Props> = ({
  title,
  subtitle,
  actionText,
  onAction,
}) => {
  return (
    <div className="card glass-premium glass-hover bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/15 relative overflow-hidden rounded-xl">
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-primary to-secondary opacity-20 blur-3xl rounded-full -translate-y-8 translate-x-8" />

      <div className="card-body relative z-10 p-6">
        <h2 className="text-3xl font-bold gradient-text">{title}</h2>
        {subtitle && <p className="text-base-content/70 mt-2">{subtitle}</p>}
        {actionText && (
          <div className="card-actions justify-end mt-4">
            <button onClick={onAction} className="btn btn-primary btn-sm">
              {actionText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradientHeroCard;
