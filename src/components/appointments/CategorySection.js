import { ICF_CATEGORIES, ICF_QUALIFIERS } from "@/data/icfCategories";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

export default function CategorySection({
  categoryKey,
  icfAssessment,
  updateICFItem,
  addICFCategory,
  removeICFCategory,
  filterCategories,
  searchTerm,
  readOnly,
}) {
  // Właściwe kwalifikatory na podstawie klucza
  const qualifierKey = categoryKey;
  const qualifiers = ICF_QUALIFIERS[qualifierKey] || {};

  return (
    <>
      <Card>
        <Card.Header>
          <h4 className="font-semibold">Ocenione kategorie</h4>
        </Card.Header>
        <Card.Content>
          {Object.keys(icfAssessment[categoryKey] || {}).length === 0 ? (
            <p className="text-gray-500">Brak ocenionych kategorii</p>
          ) : (
            Object.entries(icfAssessment[categoryKey]).map(
              ([code, assessment]) => {
                const category = ICF_CATEGORIES[categoryKey]?.[code];
                if (!category) return null;

                const qualifierOptions = Object.entries(qualifiers).map(
                  ([val, text]) => ({ value: val, label: `${val} – ${text}` })
                );

                return (
                  <div
                    key={code}
                    className="border rounded-lg p-3 mb-2 flex flex-col md:flex-row md:items-center md:gap-4"
                  >
                    <Badge variant="outline">{code}</Badge>
                    <div className="flex-grow">
                      <h5 className="font-semibold">{category.title}</h5>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:items-center">
                      <Select
                        options={qualifierOptions}
                        value={qualifierOptions.find(
                          (opt) => opt.value === assessment.qualifier
                        )}
                        onChange={(opt) =>
                          updateICFItem(
                            categoryKey,
                            code,
                            "qualifier",
                            opt.value
                          )
                        }
                        isDisabled={readOnly}
                        className="w-full md:w-48"
                      />
                      <Input
                        placeholder="Dodatkowe uwagi..."
                        value={assessment.notes || ""}
                        onChange={(e) =>
                          updateICFItem(
                            categoryKey,
                            code,
                            "notes",
                            e.target.value
                          )
                        }
                        disabled={readOnly}
                      />
                      {!readOnly && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => removeICFCategory(categoryKey, code)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }
            )
          )}
        </Card.Content>
      </Card>

      {!readOnly && (
        <Card>
          <Card.Header>
            <h4 className="font-semibold">Dostępne kategorie</h4>
          </Card.Header>
          <Card.Content>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {filterCategories(ICF_CATEGORIES[categoryKey], searchTerm)
                .filter(([code]) => !icfAssessment[categoryKey]?.[code])
                .map(([code, category]) => (
                  <div
                    key={code}
                    className="border rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{code}</Badge>
                      <span>{category.title}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addICFCategory(categoryKey, code)}
                    >
                      Dodaj
                    </Button>
                  </div>
                ))}
            </div>
          </Card.Content>
        </Card>
      )}
    </>
  );
}
