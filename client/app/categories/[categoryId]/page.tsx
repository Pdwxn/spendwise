import { PageHeader } from "@/components/layout/PageHeader";
import { CategoryTransactions } from "@/components/categories/CategoryTransactions";

type CategoryDetailPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { categoryId } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category detail"
        description="Transactions associated with a single category."
      />

      <CategoryTransactions categoryId={categoryId} />
    </div>
  );
}
