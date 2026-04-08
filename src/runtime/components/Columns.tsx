import type { ReactNode } from 'react';

export interface ColumnsProps {
  left: ReactNode;
  right: ReactNode;
}

export function Columns({ left, right }: ColumnsProps) {
  return <div className="grid gap-6 md:grid-cols-2">{left}{right}</div>;
}
