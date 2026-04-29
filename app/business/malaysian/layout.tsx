import MalaysianFormShell from "./MalaysianFormShell";

export default function MalaysianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MalaysianFormShell>{children}</MalaysianFormShell>;
}