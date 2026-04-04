"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { getAllContacts, type Contact } from "@/actions/contact";
import { ContactTable } from "@/app/admin/contact/contact-table";

export default function ContactManagementPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContacts = async () => {
    try {
      const data = await getAllContacts();
      setContacts(data);
    } catch (error) {
      console.error("Failed to load contacts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Chargement des contacts...</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-(--sf-red-700)" />
          Gestion des contacts
        </h1>
      </div>

      <p className="text-muted-foreground">Ajoutez, modifiez ou supprimez les contacts.</p>

      <ContactTable contacts={contacts} onRefresh={loadContacts} />
    </div>
  );
}
