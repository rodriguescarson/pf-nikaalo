import { redirect } from "next/navigation";
import { getUan } from "@/lib/session";

/** Every page past login needs an open khata. */
export default async function JourneyLayout({ children }: LayoutProps<"/">) {
  const uan = await getUan();
  if (!uan) redirect("/login");
  return <>{children}</>;
}
