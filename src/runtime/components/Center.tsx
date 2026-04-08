export function Center({
   children,
   className,
}: {
   children: React.ReactNode;
   className?: string;
}) {
   return (
      <div
         className={`flex gap-4 flex-col items-center justify-center *:text-center ${className}`}
      >
         {children}
      </div>
   );
}
