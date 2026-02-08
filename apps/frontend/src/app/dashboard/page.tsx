import { isApiMode } from "@/lib/data-provider";
import MockDashboard from "./MockDashboard";
import ApiDashboard from "./ApiDashboard";

export default function DashboardPage() {
  if (isApiMode()) {
    return <ApiDashboard />;
  }

  return <MockDashboard />;
}
