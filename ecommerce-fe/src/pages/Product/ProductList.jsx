import ProductCard from "@components/product/ProductCard";
// hoặc thêm ProductGrid nếu muốn wrap grid:
// import ProductGrid from "@components/product/ProductGrid";

export default function ProductList() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} item={p} />
      ))}
    </div>
  );
}
