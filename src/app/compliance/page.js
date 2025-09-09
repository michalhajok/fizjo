"use client";

import { useState } from "react";
import { useAuth } from "@/hooks";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";

export default function CompliancePage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" text="Ładowanie..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Nagłówek */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Zgodność z RODO</h1>
          <p className="text-gray-600">
            Informacje o ochronie danych osobowych
          </p>
        </div>
      </div>

      {/* Status zgodności */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Status zgodności
                </p>
                <p className="text-lg font-bold text-green-600">
                  ✅ Zgodny z RODO
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                🔒
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ostatnia aktualizacja
                </p>
                <p className="text-lg font-bold text-gray-900">28.08.2025</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                📅
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certyfikat</p>
                <p className="text-lg font-bold text-purple-600">Aktywny</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                🏆
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Główne sekcje informacyjne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prawa pacjentów */}
        <Card>
          <Card.Header>
            <Card.Title>📜 Prawa pacjentów zgodnie z RODO</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">
                  Art. 15 - Prawo dostępu do danych
                </h4>
                <p className="text-sm text-gray-600">
                  Pacjent ma prawo otrzymać kopię swoich danych osobowych
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium">Art. 16 - Prawo sprostowania</h4>
                <p className="text-sm text-gray-600">
                  Pacjent może żądać poprawienia nieprawidłowych danych
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-medium">Art. 17 - Prawo do usunięcia</h4>
                <p className="text-sm text-gray-600">
                  Prawo do bycia zapomnianym (z wyjątkami medycznymi)
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-medium">
                  Art. 18 - Ograniczenie przetwarzania
                </h4>
                <p className="text-sm text-gray-600">
                  Pacjent może ograniczyć sposób przetwarzania danych
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium">Art. 20 - Przenośność danych</h4>
                <p className="text-sm text-gray-600">
                  Prawo do otrzymania danych w formacie umożliwiającym
                  przeniesienie
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium">Art. 21 - Prawo sprzeciwu</h4>
                <p className="text-sm text-gray-600">
                  Sprzeciw wobec przetwarzania w celach marketingowych
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Podstawy prawne */}
        <Card>
          <Card.Header>
            <Card.Title>⚖️ Podstawy prawne przetwarzania</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800">
                  Art. 6 ust. 1 lit. c) RODO
                </h4>
                <p className="text-sm text-green-700">
                  Obowiązek prawny - dokumentacja medyczna
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">
                  Art. 6 ust. 1 lit. f) RODO
                </h4>
                <p className="text-sm text-blue-700">
                  Prawnie uzasadniony interes - kontakt z pacjentem
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800">
                  Art. 9 ust. 2 lit. h) RODO
                </h4>
                <p className="text-sm text-purple-700">
                  Opieka zdrowotna - dane szczególnej kategorii
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-800">
                  Zgoda (Art. 6 ust. 1 lit. a)
                </h4>
                <p className="text-sm text-orange-700">
                  Marketing, newsletter, badania
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Zabezpieczenia */}
      <Card>
        <Card.Header>
          <Card.Title>🔒 Zabezpieczenia techniczne i organizacyjne</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Zabezpieczenia techniczne</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Szyfrowanie danych SSL/TLS</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Hasła szyfrowane w bazie</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Kopie zapasowe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Firewall i antywirus</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Aktualizacje systemu</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Kontrola dostępu</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Uwierzytelnianie użytkowników</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Role i uprawnienia</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Logi aktywności</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Automatyczne wylogowywanie</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Ograniczenia IP</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Procedury organizacyjne</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Polityka prywatności</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Szkolenia personelu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Procedury incydentów</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Ocena skutków (DPIA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Rejestr czynności</span>
                </div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Terminy i procedury */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>⏱️ Terminy realizacji wniosków</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="font-medium">
                  Standardowy termin odpowiedzi
                </span>
                <Badge color="blue">30 dni</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                <span className="font-medium">Możliwe przedłużenie</span>
                <Badge color="yellow">+60 dni</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="font-medium">Informacja o przedłużeniu</span>
                <Badge color="green">30 dni</Badge>
              </div>
              <div className="text-sm text-gray-600 mt-4">
                <strong>Uwaga:</strong> Przedłużenie możliwe tylko w przypadku
                złożonych wniosków z uwzględnieniem liczby osób, których dotyczą
                żądania.
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>📋 Procedura obsługi wniosków</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Przyjęcie wniosku</h4>
                  <p className="text-sm text-gray-600">
                    Rejestracja wniosku pacjenta
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Weryfikacja tożsamości</h4>
                  <p className="text-sm text-gray-600">
                    Potwierdzenie tożsamości wnioskodawcy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Analiza wniosku</h4>
                  <p className="text-sm text-gray-600">
                    Ocena czy wniosek jest zasadny
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Realizacja</h4>
                  <p className="text-sm text-gray-600">
                    Wykonanie wniosku w terminie
                  </p>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Kontakt */}
      <Card>
        <Card.Header>
          <Card.Title>📞 Kontakt w sprawach RODO</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Administrator danych</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Gabinet Fizjoterapii</strong>
                </p>
                <p>ul. Przykładowa 123</p>
                <p>00-000 Warszawa</p>
                <p>📧 rodo@fizgab.pl</p>
                <p>📞 +48 123 456 789</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Jak złożyć wniosek RODO?</h4>
              <div className="space-y-2 text-sm">
                <p>• Osobiście w gabinecie</p>
                <p>• Pocztą na adres gabinetu</p>
                <p>• Email na adres: rodo@fizgab.pl</p>
                <p>• Wniosek musi zawierać dane umożliwiające identyfikację</p>
                <p>• Dołączyć kopię dokumentu tożsamości</p>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Dokumenty */}
      <Card>
        <Card.Header>
          <Card.Title>📄 Dokumenty i regulaminy</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <span className="text-2xl">📋</span>
              <span>Polityka prywatności</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <span className="text-2xl">📑</span>
              <span>Regulamin gabinetu</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <span className="text-2xl">🔒</span>
              <span>Procedury RODO</span>
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
