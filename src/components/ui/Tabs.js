export default function Tabs({ value, onChange, tabs }) {
  return (
    <div className="flex border-b mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`px-4 py-2 -mb-px border-b-2 ${
            value === tab.value
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-gray-600"
          }`}
          onClick={() => onChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
