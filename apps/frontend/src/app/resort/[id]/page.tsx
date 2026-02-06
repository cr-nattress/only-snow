import { isApiMode, fetchResortDetail } from "@/lib/resort-detail";
import MockResortDetail from "./MockResortDetail";
import ApiResortDetail from "./ApiResortDetail";

export const dynamic = 'force-dynamic';

export default async function ResortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (isApiMode()) {
    const data = await fetchResortDetail(id);
    if (!data) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500 dark:text-slate-400">Resort not found</p>
        </div>
      );
    }

    return <ApiResortDetail data={data} />;
  }

  return <MockResortDetail id={id} />;
}
