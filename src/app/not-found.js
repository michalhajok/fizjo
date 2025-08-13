import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md text-center space-y-6">
        <div className="text-8xl">🏥</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Strona nie została znaleziona
          </h1>
          <p className="text-gray-600 mt-2">
            Ups! Strona, której szukasz, nie istnieje lub została przeniesiona.
          </p>
        </div>
        <div className="space-x-4">
          <Link href="/dashboard">
            <Button variant="primary">Wróć do Dashboard</Button>
          </Link>
          <Link href="/signin">
            <Button variant="outline">Strona logowania</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
