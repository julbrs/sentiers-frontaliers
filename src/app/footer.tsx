import { Facebook, Globe, Mail } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-(--sf-red-900) text-white border-t border-(--sf-red-800) mt-auto">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-white/90 text-sm mb-4 sm:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold font-(family-name:--font-display)">
                Sentiers Frontaliers
              </span>
            </div>
            © {new Date().getFullYear()}
          </div>
          <div className="flex space-x-6">
            <Link
              href="https://sentiersfrontaliers.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/85 hover:text-(--sf-mist-gray) transition-colors"
              aria-label="Site web officiel"
            >
              <span className="sr-only">Site web officiel</span>
              <Globe className="h-6 w-6" />
            </Link>
            <Link
              href="https://www.facebook.com/profile.php?id=100089450023385"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/85 hover:text-(--sf-mist-gray) transition-colors"
              aria-label="Groupe Facebook"
            >
              <span className="sr-only">Groupe Facebook</span>
              <Facebook className="h-6 w-6" />
            </Link>
            <Link
              href="mailto:info@sentiersfrontaliers.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/85 hover:text-(--sf-mist-gray) transition-colors"
              aria-label="Email"
            >
              <span className="sr-only">Email</span>
              <Mail className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
