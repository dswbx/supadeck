import { useId } from 'react';
import type React from 'react';
import type { MdxComponentMap } from '../../theme-types.js';

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

function toClassName(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    const className = value
      .flatMap((entry) => (typeof entry === 'string' ? entry.split(/\s+/) : []))
      .filter(Boolean)
      .join(' ');

    return className || undefined;
  }

  return undefined;
}

function isBlockCode(
  className: unknown,
  props: Record<string, unknown>
): boolean {
  const normalizedClassName = toClassName(className) ?? '';

  return (
    'data-code-block' in props ||
    normalizedClassName.includes('language-') ||
    normalizedClassName.includes('deck-code-content')
  );
}

export interface SupabaseMarkProps extends React.ComponentProps<'svg'> {
  size?: 'footer' | 'hero';
}

export function SupabaseMark({
  size = 'footer',
  className,
  ...props
}: SupabaseMarkProps) {
  const id = useId();
  const primaryGradientId = `${id}-primary`;
  const shadowGradientId = `${id}-shadow`;
  const dimensions =
    size === 'hero'
      ? { width: 48, height: 50 }
      : { width: 22, height: 22 };

  return (
    <svg
      viewBox="0 0 109 113"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cx('supabase-mark', className)}
      {...dimensions}
      {...props}
    >
      <path
        d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9372L63.7076 110.284Z"
        fill={`url(#${primaryGradientId})`}
      />
      <path
        d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9372L63.7076 110.284Z"
        fill={`url(#${shadowGradientId})`}
        fillOpacity="0.2"
      />
      <path
        d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4177L45.317 2.07103Z"
        fill="#3ECF8E"
      />
      <defs>
        <linearGradient
          id={primaryGradientId}
          x1="53.9738"
          y1="54.974"
          x2="94.1635"
          y2="71.8295"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#249361" />
          <stop offset="1" stopColor="#3ECF8E" />
        </linearGradient>
        <linearGradient
          id={shadowGradientId}
          x1="36.1558"
          y1="30.578"
          x2="54.4844"
          y2="65.0806"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export interface SectionSlideProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionSlide({ children, className }: SectionSlideProps) {
  return <div className={cx('supabase-section-slide', className)}>{children}</div>;
}

export interface DividerProps {
  centered?: boolean;
  className?: string;
}

export function Divider({ centered = false, className }: DividerProps) {
  return <div className={cx('divider', centered && 'center-divider', className)} aria-hidden="true" />;
}

export interface TagProps {
  children: React.ReactNode;
  tone?: 'default' | 'red' | 'yellow';
  className?: string;
}

export function Tag({ children, tone = 'default', className }: TagProps) {
  return <span className={cx('tag', tone !== 'default' && tone, className)}>{children}</span>;
}

export interface WideProps {
  children: React.ReactNode;
  className?: string;
}

export function Wide({ children, className }: WideProps) {
  return <div className={cx('supabase-wide', className)}>{children}</div>;
}

export interface CardGridProps {
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

export function CardGrid({ children, columns = 3, className }: CardGridProps) {
  return (
    <div
      className={cx('row', className)}
      style={{ '--supabase-columns': String(columns) } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export interface CardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  tone?: 'default' | 'red' | 'yellow';
  className?: string;
}

export function Card({ title, children, tone = 'default', className }: CardProps) {
  return (
    <div className={cx('card', className)}>
      <h3 className={cx(tone !== 'default' && `tone-${tone}`)}>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export interface StatGridProps {
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

export function StatGrid({ children, columns = 2, className }: StatGridProps) {
  return (
    <div
      className={cx('stat-grid', className)}
      style={{ '--supabase-columns': String(columns) } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export interface StatProps {
  value: React.ReactNode;
  label: React.ReactNode;
  className?: string;
}

export function Stat({ value, label, className }: StatProps) {
  return (
    <div className={cx('stat', className)}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export interface StatusListProps {
  children: React.ReactNode;
  className?: string;
}

export function StatusList({ children, className }: StatusListProps) {
  return <div className={cx('status-list', className)}>{children}</div>;
}

export interface StatusItemProps {
  status: 'live' | 'partial' | 'planned' | 'unknown';
  name: React.ReactNode;
  note?: React.ReactNode;
  className?: string;
}

const STATUS_LABELS: Record<StatusItemProps['status'], string> = {
  live: 'live',
  partial: 'partial',
  planned: 'planned',
  unknown: '?'
};

export function StatusItem({ status, name, note, className }: StatusItemProps) {
  return (
    <div className={cx('status-item', className)}>
      <span className={cx('status-badge', status)}>{STATUS_LABELS[status]}</span>
      <span className="status-name">{name}</span>
      {note ? <span className="status-note">{note}</span> : null}
    </div>
  );
}

export function createSupabaseComponents(): MdxComponentMap {
  return {
    h1: (props: React.ComponentProps<'h1'>) => <h1 {...props} />,
    h2: (props: React.ComponentProps<'h2'>) => <h2 {...props} />,
    h3: (props: React.ComponentProps<'h3'>) => <h3 {...props} />,
    p: (props: React.ComponentProps<'p'>) => <p {...props} />,
    a: ({ className, ...props }: React.ComponentProps<'a'>) => (
      <a className={cx('supabase-link', className)} {...props} />
    ),
    ul: ({ className, ...props }: React.ComponentProps<'ul'>) => (
      <ul className={cx('supabase-list', className)} {...props} />
    ),
    ol: ({ className, ...props }: React.ComponentProps<'ol'>) => (
      <ol className={cx('supabase-list', 'supabase-list-ordered', className)} {...props} />
    ),
    li: (props: React.ComponentProps<'li'>) => <li {...props} />,
    code: ({ className, ...props }: React.ComponentProps<'code'>) => (
      <code
        className={
          isBlockCode(className, props)
            ? toClassName(className)
            : cx('supabase-inline-code', toClassName(className))
        }
        {...props}
      />
    ),
    pre: ({ className, ...props }: React.ComponentProps<'pre'>) => (
      <pre className={cx('supabase-pre', toClassName(className))} {...props} />
    ),
    table: ({ className, ...props }: React.ComponentProps<'table'>) => (
      <table className={cx('supabase-table', className)} {...props} />
    ),
    th: ({ className, ...props }: React.ComponentProps<'th'>) => (
      <th className={cx('supabase-th', className)} {...props} />
    ),
    td: ({ className, ...props }: React.ComponentProps<'td'>) => (
      <td className={cx('supabase-td', className)} {...props} />
    ),
    blockquote: ({ className, ...props }: React.ComponentProps<'blockquote'>) => (
      <blockquote className={cx('supabase-quote', className)} {...props} />
    ),
    SectionSlide,
    SupabaseMark,
    Divider,
    Tag,
    Wide,
    CardGrid,
    Card,
    StatGrid,
    Stat,
    StatusList,
    StatusItem
  };
}
