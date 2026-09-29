import { ProductDetail } from "@/components/public/product-detail";

export default async function PlatilloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
