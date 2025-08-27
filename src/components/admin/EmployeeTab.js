import React from "react";

import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const EmployeeTab = ({
  employee,
  error,
  saving,
  success,
  setShowScheduleModal,
  contractTypes,
  handleSubmit,
  handleEmployeeChange,
  handleEmployeeNestedChange,
}) => {
  const router = useRouter();

  return (
    <Card>
      <Card.Header>
        <Card.Title>Dane pracownika</Card.Title>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dane osobowe */}
          <div>
            <h3 className="font-semibold mb-2">Informacje osobowe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Imię"
                value={employee.personalInfo.firstName ?? ""}
                onChange={(e) =>
                  handleEmployeeChange(
                    "personalInfo",
                    "firstName",
                    e.target.value
                  )
                }
              />
              <Input
                label="Nazwisko"
                value={employee.personalInfo?.lastName || ""}
                onChange={(e) =>
                  handleEmployeeChange(
                    "personalInfo",
                    "lastName",
                    e.target.value
                  )
                }
              />
              <Input
                label="Data urodzenia"
                type="date"
                value={employee.personalInfo?.dateOfBirth?.slice(0, 10) || ""}
                onChange={(e) =>
                  handleEmployeeChange(
                    "personalInfo",
                    "dateOfBirth",
                    e.target.value
                  )
                }
              />
              <Select
                label="Płeć"
                options={[
                  { value: "M", label: "Mężczyzna" },
                  { value: "F", label: "Kobieta" },
                  { value: "Other", label: "Inna" },
                ]}
                value={{
                  value: employee.personalInfo?.gender,
                  label: employee.personalInfo?.gender,
                }}
                onChange={(o) =>
                  handleEmployeeChange("personalInfo", "gender", o.value)
                }
              />
              <Input
                label="Telefon"
                value={employee.personalInfo?.contact?.phone || ""}
                onChange={(e) =>
                  handleEmployeeNestedChange(
                    "personalInfo",
                    "contact",
                    "phone",
                    e.target.value
                  )
                }
              />
              <Input
                label="Email"
                value={employee.personalInfo?.contact?.email || ""}
                onChange={(e) =>
                  handleEmployeeNestedChange(
                    "personalInfo",
                    "contact",
                    "email",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <Input
                label="Ulica"
                value={employee.personalInfo?.address?.street || ""}
                onChange={(e) =>
                  handleEmployeeNestedChange(
                    "personalInfo",
                    "address",
                    "street",
                    e.target.value
                  )
                }
              />
              <Input
                label="Miasto"
                value={employee.personalInfo?.address?.city || ""}
                onChange={(e) =>
                  handleEmployeeNestedChange(
                    "personalInfo",
                    "address",
                    "city",
                    e.target.value
                  )
                }
              />
              <Input
                label="Kod pocztowy"
                value={employee.personalInfo?.address?.postalCode || ""}
                onChange={(e) =>
                  handleEmployeeNestedChange(
                    "personalInfo",
                    "address",
                    "postalCode",
                    e.target.value
                  )
                }
              />
              <Input
                label="Kraj"
                value={employee.personalInfo?.address?.country || ""}
                onChange={(e) =>
                  handleEmployeeNestedChange(
                    "personalInfo",
                    "address",
                    "country",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
          {/* Dane zawodowe */}
          <div>
            <h3 className="font-semibold mb-2">Informacje zawodowe</h3>
            <Input
              label="Stanowisko"
              value={employee.professionalInfo?.position || ""}
              onChange={(e) =>
                handleEmployeeChange(
                  "professionalInfo",
                  "position",
                  e.target.value
                )
              }
            />
            <Input
              label="Specjalizacje (przecinek)"
              value={
                employee.professionalInfo?.specializations?.join(", ") || ""
              }
              onChange={(e) =>
                handleEmployeeChange(
                  "professionalInfo",
                  "specializations",
                  e.target.value.split(",").map((s) => s.trim())
                )
              }
            />
            <Input
              label="Biografia"
              as="textarea"
              value={employee.professionalInfo?.biography || ""}
              onChange={(e) =>
                handleEmployeeChange(
                  "professionalInfo",
                  "biography",
                  e.target.value
                )
              }
              rows={3}
            />
            <Input
              label="Lata doświadczenia"
              type="number"
              value={employee.professionalInfo?.yearsOfExperience || ""}
              onChange={(e) =>
                handleEmployeeChange(
                  "professionalInfo",
                  "yearsOfExperience",
                  e.target.value
                )
              }
            />
            {/* Możesz dodać edycję licencji, edukacji, certyfikatów */}
          </div>
          {/* Informacje o zatrudnieniu */}
          <div>
            {/* <h3 className="font-semibold mb-2">Informacje o zatrudnieniu</h3>
            <Input
              label="Data zatrudnienia"
              type="date"
              value={
                employee.employmentInfo?.employmentDate?.slice(0, 10) || ""
              }
              onChange={(e) =>
                handleEmployeeChange(
                  "employmentInfo",
                  "employmentDate",
                  e.target.value
                )
              }
            />
            <Select
              label="Typ umowy"
              options={contractTypes}
              value={contractTypes.find(
                (o) => o.value === employee.employmentInfo?.contractType
              )}
              onChange={(o) =>
                handleEmployeeChange("employmentInfo", "contractType", o.value)
              }
            />
            <Input
              label="Dział"
              value={employee.employmentInfo?.department || ""}
              onChange={(e) =>
                handleEmployeeChange(
                  "employmentInfo",
                  "department",
                  e.target.value
                )
              }
            /> */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowScheduleModal(true);
              }}
            >
              Harmonogram
            </Button>
          </div>
          {error && (
            <div className="text-red-600 bg-red-50 p-2 rounded">{error}</div>
          )}
          {success && (
            <div className="text-green-600 bg-green-50 p-2 rounded">
              Zmiany zostały zapisane!
            </div>
          )}
          <div className="flex justify-end gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Anuluj
            </Button>
            <Button type="submit" loading={saving}>
              Zapisz zmiany
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
};

export default EmployeeTab;
