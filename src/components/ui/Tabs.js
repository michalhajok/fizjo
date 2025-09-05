export default function Tabs({ value, onChange, tabs }) {
  return (
    <div className="flex border-b mb-4">
      {tabs.map((tab) => {
        const key = tab.value || tab.key;
        return (
          <button
            key={key}
            className={`px-4 py-2 -mb-px border-b-2 ${
              value === key
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-gray-600"
            }`}
            onClick={() => onChange(key)}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
