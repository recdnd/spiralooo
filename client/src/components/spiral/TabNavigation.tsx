interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs = [
    { id: "fragments", label: "📄 Fragments" },
    { id: "modules", label: "✦ Modules" },
    { id: "settings", label: "⚙️ Settings" },
    { id: "archive", label: "🗄️ Archive" },
  ];

  return (
    <div className="flex space-x-1 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
