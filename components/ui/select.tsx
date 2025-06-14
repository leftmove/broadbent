import * as React from "react";
import { cn } from "lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-select-root]")) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" data-select-root>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value,
            onValueChange,
            open,
            setOpen,
          } as any);
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value?: string;
    open?: boolean;
    setOpen?: (open: boolean) => void;
  }
>(({ className, children, value: _value, open, setOpen, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    onClick={() => setOpen?.(!open)}
    {...props}
  >
    {children}
    <ChevronDown
      className={cn(
        "w-4 h-4 opacity-50 transition-transform duration-200",
        open && "rotate-180"
      )}
    />
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({
  placeholder,
  value,
}: {
  placeholder?: string;
  value?: string;
}) => <span>{value || placeholder}</span>;

const SelectContent = ({
  children,
  open,
  setOpen,
  onValueChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  onValueChange?: (value: string) => void;
}) => {
  if (!open) return null;

  return (
    <div className="absolute left-0 right-0 z-50 mt-1 duration-200 border rounded-md shadow-lg top-full bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95">
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onValueChange,
              setOpen,
            } as any);
          }
          return child;
        })}
      </div>
    </div>
  );
};

const SelectItem = ({
  value,
  children,
  onValueChange,
  setOpen,
}: {
  value: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  setOpen?: (open: boolean) => void;
}) => (
  <div
    className="relative flex items-center px-3 py-2 text-sm transition-colors duration-150 rounded-sm outline-none cursor-pointer select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onValueChange?.(value);
      setOpen?.(false);
    }}
  >
    {children}
  </div>
);

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
