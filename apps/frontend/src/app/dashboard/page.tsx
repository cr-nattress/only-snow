import { isApiMode, fetchDashboardData } from "@/lib/data-provider";
import MockDashboard from "./MockDashboard";
import ApiDashboard from "./ApiDashboard";

export default async function DashboardPage() {
  if (isApiMode()) {
    const data = await fetchDashboardData();
    return <ApiDashboard data={data} />;
  }

  return <MockDashboard />;
}
