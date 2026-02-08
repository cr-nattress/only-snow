import { isApiMode } from "@/lib/data-provider";
import MockChasePage from "./MockChasePage";
import ApiChasePage from "./ApiChasePage";

export default function ChasePage() {
  if (isApiMode()) {
    return <ApiChasePage />;
  }

  return <MockChasePage />;
}
