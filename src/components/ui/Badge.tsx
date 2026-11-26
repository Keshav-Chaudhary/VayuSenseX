import React from 'react';
import { cn } from './cn';

export type BadgeTone = 'neutral' | 'positive' | 'caution' | 'critical' | 'accent' | 'info';
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly tone?: BadgeTone;
  readonly variant?: BadgeVariant;
  readonly size?: BadgeSize;
}

function getVariantClasses(variant: BadgeVariant): string {
  switch (variant) {
    case 'success':
      return 'bg-[var(--positive-subtle)] text-[var(--positive)] border-[var(--positive-subtle)] border';
    case 'warning':
      return 'bg-[var(--caution-subtle)] text-[var(--caution)] border-[var(--caution-subtle)] border';
    case 'danger':
      return 'bg-[var(--critical-subtle)] text-[var(--critical)] border-[var(--critical-subtle)] border';
    case 'info':
      return 'bg-[var(--neutral-subtle)] text-[var(--neutral)] border-[var(--neutral-subtle)] border';
    case 'outline':
      return 'bg-transparent text-[var(--fg)] border-[var(--border)] border';
    case 'default':
    default:
      return 'bg-[var(--surface-3)] text-[var(--fg)] border-[var(--border)] border';
  }
}

function getToneClasses(tone: BadgeTone): string {
  switch (tone) {
    case 'positive':
      return 'bg-[var(--positive-subtle)] text-[var(--positive)] border-[var(--positive-subtle)] border';
    case 'caution':
      return 'bg-[var(--caution-subtle)] text-[var(--caution)] border-[var(--caution-subtle)] border';
    case 'critical':
      return 'bg-[var(--critical-subtle)] text-[var(--critical)] border-[var(--critical-subtle)] border';
    case 'accent':
      return 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent-line)] border';
    case 'info':
      return 'bg-[var(--neutral-subtle)] text-[var(--neutral)] border-[var(--neutral-subtle)] border';
    case 'neutral':
    default:
      return 'bg-[var(--surface-3)] text-[var(--fg-muted)] border-[var(--border)] border';
  }
}

export function Badge({
  tone,
  variant,
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const styleClasses = variant ? getVariantClasses(variant) : getToneClasses(tone ?? 'neutral');
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors select-none',
        styleClasses,
        sizeClasses,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
