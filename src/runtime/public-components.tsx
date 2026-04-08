import React from 'react';
import { Accordion } from '@base-ui-components/react/accordion';

type CalloutTone = 'default' | 'accent' | 'danger';

interface CalloutProps {
  children: React.ReactNode;
  tone?: CalloutTone;
}

interface ColumnsProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

interface DisclosureProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

interface FrameProps {
  children: React.ReactNode;
}

function toneClasses(tone: CalloutTone): string {
  if (tone === 'accent') {
    return 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10';
  }
  if (tone === 'danger') {
    return 'border-red-500/50 bg-red-500/10';
  }
  return 'border-[color:var(--color-border)] bg-white/60 dark:bg-white/5';
}

export function Callout({ children, tone = 'default' }: CalloutProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border px-6 py-5 text-xl shadow-lg shadow-black/5 backdrop-blur ${toneClasses(
        tone
      )}`}
    >
      {children}
    </div>
  );
}

export function Columns({ left, right }: ColumnsProps) {
  return <div className="grid gap-6 md:grid-cols-2">{left}{right}</div>;
}

export function Disclosure({ title, children }: DisclosureProps) {
  return (
    <Accordion.Root className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white/70 dark:bg-white/5">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger className="flex w-full items-center justify-between px-5 py-4 text-left text-xl font-semibold">
            <span>{title}</span>
            <span aria-hidden="true">+</span>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className="px-5 pb-5 text-lg text-[color:var(--color-foreground)]/80">
          {children}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}

export function Frame({ children }: FrameProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white/70 p-8 shadow-xl shadow-black/10 dark:bg-white/5">
      {children}
    </div>
  );
}
