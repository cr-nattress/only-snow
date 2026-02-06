import { isApiMode, fetchChasePageData } from "@/lib/data-provider";
import MockChasePage from "./MockChasePage";
import ApiChasePage from "./ApiChasePage";

export const dynamic = 'force-dynamic';

export default async function ChasePage() {
  if (isApiMode()) {
    const data = await fetchChasePageData();
    return <ApiChasePage data={data} />;
  }

  return <MockChasePage />;
}
