import { generateResetLink, sendResetEmail } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function ResetPassword({
  resetModal,
  setResetModal,
  generatingLink,
  setGeneratingLink,
}) {
  const handleGenerateResetLink = async (user) => {
    setGeneratingLink(true);
    try {
      const { data, error } = await generateResetLink(user.id);

      if (error) {
        alert("Błąd generowania linku: " + error);
        return;
      }

      // Pokaż link w modal lub skopiuj do schowka
      const resetUrl = `${window.location.origin}/reset-password?token=${data.token}`;

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(resetUrl);
        alert("Link do resetowania hasła został skopiowany do schowka!");
      } else {
        // Fallback - pokaż link w modal
        setResetModal({
          open: true,
          user,
          resetUrl,
        });
      }
    } catch (err) {
      alert("Wystąpił błąd podczas generowania linku");
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleSendResetEmail = async (user, customMessage = "") => {
    setGeneratingLink(true);
    try {
      const { error } = await sendResetEmail(user.id, {
        customMessage:
          customMessage ||
          `Witaj ${user.firstName}! Administrator wygenerował dla Ciebie link do ustawienia hasła w systemie FizjoCare.`,
      });

      if (error) {
        alert("Błąd wysyłania emaila: " + error);
      } else {
        alert(`Email z linkiem resetowania został wysłany do ${user.email}`);
      }
    } catch (err) {
      alert("Wystąpił błąd podczas wysyłania emaila");
    } finally {
      setGeneratingLink(false);
    }
  };

  return (
    <Modal
      isOpen={resetModal.open}
      onClose={() => setResetModal({ open: false, user: null })}
      title="Reset hasła użytkownika"
    >
      <div className="space-y-4">
        {resetModal.user && (
          <>
            <div>
              <h3 className="font-medium mb-2 text-gray-600">Użytkownik:</h3>
              <p className="text-gray-600">
                {resetModal.user.firstName} {resetModal.user.lastName}
              </p>
              <p className="text-sm text-gray-500">{resetModal.user.email}</p>
            </div>

            {resetModal.resetUrl ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link resetowania hasła:
                </label>
                <div className="p-3 bg-gray-50 border rounded text-sm font-mono break-all">
                  {resetModal.resetUrl}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() =>
                      navigator.clipboard.writeText(resetModal.resetUrl)
                    }
                  >
                    Skopiuj link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setResetModal({ open: false, user: null })}
                  >
                    Zamknij
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => handleGenerateResetLink(resetModal.user)}
                  disabled={generatingLink}
                  className="w-full"
                >
                  {generatingLink
                    ? "Generowanie..."
                    : "Wygeneruj link resetowania"}
                </Button>

                <Button
                  onClick={() => handleSendResetEmail(resetModal.user)}
                  disabled={generatingLink}
                  variant="outline"
                  className="w-full"
                >
                  {generatingLink ? "Wysyłanie..." : "Wyślij email z linkiem"}
                </Button>

                <div className="text-xs text-gray-500">
                  Link będzie ważny przez 24 godziny
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
