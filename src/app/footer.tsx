import { Facebook, Globe, Mountain } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-emerald-900 text-emerald-50 border-t border-emerald-800 mt-auto">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-emerald-100 text-sm mb-4 sm:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <Mountain size={18} className="text-amber-400" />
              <span className="font-semibold">Sentiers Frontaliers</span>
            </div>
            © {new Date().getFullYear()} Réseau de 140+ km entre Canada et USA
          </div>
          <div className="flex space-x-6">
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-200 hover:text-amber-300 transition-colors"
              aria-label="Site web officiel"
            >
              <span className="sr-only">Site web officiel</span>
              <Globe className="h-6 w-6" />
            </Link>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-200 hover:text-amber-300 transition-colors"
              aria-label="Groupe Facebook"
            >
              <span className="sr-only">Groupe Facebook</span>
              <Facebook className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
