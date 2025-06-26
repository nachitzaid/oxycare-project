import * as React from "react";

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Popover({ isOpen, onOpenChange, children, ...props }: PopoverProps) {
  // Simple popover logic (à remplacer par une vraie lib si besoin)
  const [open, setOpen] = React.useState(isOpen ?? false);

  React.useEffect(() => {
    if (isOpen !== undefined) setOpen(isOpen);
  }, [isOpen]);

  const handleToggle = () => {
    setOpen((prev) => {
      onOpenChange?.(!prev);
      return !prev;
    });
  };

  return (
    <div {...props}>
      <div onClick={handleToggle} style={{ display: "inline-block", cursor: "pointer" }}>
        {/* PopoverTrigger: premier enfant */}
        {React.Children.toArray(children)[0]}
      </div>
      {open && (
        <div style={{ position: "absolute", zIndex: 1000, background: "white", border: "1px solid #ccc", borderRadius: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", marginTop: 8 }}>
          {/* PopoverContent: deuxième enfant */}
          {React.Children.toArray(children)[1]}
        </div>
      )}
    </div>
  );
}

export function PopoverTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function PopoverContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
