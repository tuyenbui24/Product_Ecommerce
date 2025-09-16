import { Link } from "react-router-dom";
import logo from "@assets/logo.png";

export default function AuthTopBar() {
  return (
    <div className="h-16 bg-gradient-to-b from-yellow-100 to-white shadow">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center">
        <Link to="/" className="flex items-center gap-2" aria-label="Về trang chủ">
          <img src={logo} alt="YD" className="h-10 w-auto" />
          <div className="h-10 w-10 rounded bg-yellow-400 grid place-items-center font-bold">YD</div>
          <span className="text-lg font-semibold text-gray-800">Clothing Store</span>
        </Link>
      </div>
    </div>
  );
}
