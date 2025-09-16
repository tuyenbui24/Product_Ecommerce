import { getToken } from "@/utils/storage";
import { useNavigate, Link } from "react-router-dom";

export default function ProductCard({ item }) {
  const navigate = useNavigate();

  const onAdd = () => {
    if (!getToken()) { 
      navigate("/login"); 
      return; 
    }
    navigate(`/products/detail/${item.id}`);
  };

  return (
    <div className="rounded-lg border p-3">
      <button
        type="button"
        onClick={onAdd}
        className="h-10 px-4 rounded border hover:bg-yellow-50"
      >
        Thêm vào giỏ
      </button>

      <div className="mt-2 text-sm">
        <Link to={`/products/detail/${item.id}`} className="text-blue-600 hover:underline">
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
