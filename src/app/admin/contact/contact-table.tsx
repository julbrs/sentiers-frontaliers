"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactDialog } from "@/app/admin/contact/contact-dialog";
import { deleteContact, type Contact } from "@/actions/contact";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type ContactTableProps = {
  contacts: Contact[];
  onRefresh: () => void;
};

export function ContactTable({ contacts, onRefresh }: ContactTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, fullName: string) => {
    if (!confirm(`Supprimer le contact ${fullName} ?`)) return;

    try {
      setDeletingId(id);
      await deleteContact(id);
      toast("Contact supprimé", { description: `${fullName} a été supprimé.` });
      onRefresh();
    } catch (error) {
      toast.error("Erreur", {
        description: "Impossible de supprimer ce contact.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Contacts</CardTitle>
        <ContactDialog onSuccess={onRefresh} />
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun contact trouvé.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prénom</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.firstName}</TableCell>
                  <TableCell className="font-medium">{c.lastName}</TableCell>
                  <TableCell>{c.phone || "—"}</TableCell>
                  <TableCell>{c.email || "—"}</TableCell>
                  <TableCell>{c.address || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <ContactDialog contact={c} onSuccess={onRefresh} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(c.id, `${c.firstName} ${c.lastName}`)}
                        disabled={deletingId === c.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
