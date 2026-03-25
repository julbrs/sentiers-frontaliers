"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { getAllUsers, type User } from "@/actions/user";
import { UserTable } from "@/app/admin/user/user-table";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Chargement des utilisateurs...</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-(--sf-red-700)" />
          Gestion des utilisateurs
        </h1>
      </div>

      <p className="text-muted-foreground">
        Ajoutez, modifiez ou supprimez les utilisateurs de l'application.
      </p>

      <UserTable users={users} onRefresh={loadUsers} />
    </div>
  );
}
