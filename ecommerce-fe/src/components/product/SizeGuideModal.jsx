import { useState } from "react";

import sizeNam from "@/assets/size/size-nam.png";
import sizeNu from "@/assets/size/size-nu.png";
import sizeTreem from "@/assets/size/size-treem.png";

export default function SizeGuideModal({ open, onClose }) {
  const [tab, setTab] = useState("nam");

  if (!open) return null;

  const tabs = [
    { key: "nam", label: "Nam" },
    { key: "nu", label: "Nữ" },
    { key: "treem", label: "Trẻ em" },
  ];

  const imgSrc = {
    nam: sizeNam,
    nu: sizeNu,
    treem: sizeTreem,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h2 className="font-semibold text-lg">Bảng kích thước</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex border-b text-sm">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 font-medium transition-colors ${
                tab === t.key
                  ? "border-b-2 border-amber-500 text-amber-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <img
            src={imgSrc[tab]}
            alt={`size-${tab}`}
            className="w-full h-auto rounded-lg shadow-sm"
          />
        </div>

        <div className="border-t px-4 py-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-amber-500 text-white hover:bg-amber-600"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
