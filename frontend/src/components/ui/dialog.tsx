import * as React from "react";

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [isOpen, setIsOpen] = React.useState(open ?? false);

  React.useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: 8, minWidth: 320, minHeight: 120, padding: 24, position: "relative" }}>
        {children}
        <button onClick={handleClose} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>&times;</button>
      </div>
    </div>
  );
}

export function DialogTrigger({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <span onClick={onClick} style={{ cursor: "pointer" }}>{children}</span>;
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: 16 }}>{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 20, fontWeight: 600 }}>{children}</h2>;
}
