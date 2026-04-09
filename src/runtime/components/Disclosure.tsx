import { Accordion } from '@base-ui/react/accordion';
import type { ReactNode } from 'react';

export interface DisclosureProps {
  title: ReactNode;
  children: ReactNode;
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
