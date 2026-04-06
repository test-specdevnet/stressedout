import type { LucideIcon } from "lucide-react";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

type GlassButtonProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    icon?: LucideIcon;
    variant?: "primary" | "secondary";
  }
>;

export function GlassButton({
  children,
  className = "",
  icon: Icon,
  variant = "primary",
  ...props
}: GlassButtonProps) {
  return (
    <a
      className={`glass-button glass-button--${variant} ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      {Icon ? <Icon size={18} strokeWidth={2} /> : null}
    </a>
  );
}
