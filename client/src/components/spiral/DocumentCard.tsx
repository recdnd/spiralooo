import { Fragment } from "@shared/schema";

interface DocumentCardProps {
  fragment: Fragment;
  onClick: () => void;
}

export default function DocumentCard({ fragment, onClick }: DocumentCardProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case "active": return "active";
      case "sealed": return "sealed";
      case "processing": return "processing";
      default: return "active";
    }
  };

  const getPermissionDisplay = () => {
    if (fragment.accessTier?.includes("Public")) return "RW";
    if (fragment.editRestriction?.includes("Sovereignty")) return "RWX+M";
    return "RWX";
  };

  return (
    <div className="doc-card" onClick={onClick}>
      <div className="corner-fold"></div>
      <div className="doc-content">
        <div className="doc-label">
          <span className="text-spiral-red text-xs font-medium">
            {fragment.fragmentId}
          </span>
          <br />
          <span className="text-xs text-spiral-gray">
            {getPermissionDisplay()}
          </span>
        </div>
        <div className={`doc-status ${getStatusClass(fragment.status || "active")}`}></div>
        <div className="doc-glyph">
          {fragment.fragmentId?.match(/Fragment-([^/]+)/)?.[1] || "✞"}
        </div>
      </div>
    </div>
  );
}
