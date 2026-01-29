import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

const HOME_PATH = "/";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="space-y-6">
        <div className="flex">
          <Button variant="outline" size="sm" asChild>
            <Link href={HOME_PATH} className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
