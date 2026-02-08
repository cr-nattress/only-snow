import { ApiReference } from '@scalar/nextjs-api-reference';
import { openApiSpec } from '@/lib/openapi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = ApiReference({
  spec: {
    content: openApiSpec,
  },
  theme: 'purple',
  layout: 'modern',
  darkMode: true,
  showSidebar: true,
  searchHotKey: 'k',
} as any);
