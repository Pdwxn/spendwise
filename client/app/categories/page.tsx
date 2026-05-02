import { CategoryForm } from "@/components/categories/CategoryForm";
import { CategoryList } from "@/components/categories/CategoryList";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Organiza tus categorías con nombre, emoji y color."
      />

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <CategoryForm />
        <CategoryList />
      </section>
    </div>
  );
}
