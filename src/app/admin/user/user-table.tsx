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
import { UserDialog } from "@/app/admin/user/user-dialog";
import { deleteUser, type User } from "@/actions/user";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type UserTableProps = {
  users: User[];
  onRefresh: () => void;
};

export function UserTable({ users, onRefresh }: UserTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, fullName: string) => {
    if (!confirm(`Delete user ${fullName}?`)) return;

    try {
      setDeletingId(id);
      await deleteUser(id);
      toast("User deleted", { description: `${fullName} has been removed.` });
      onRefresh();
    } catch (error) {
      toast.error("Error", {
        description: "Unable to delete this user.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Users</CardTitle>
        <UserDialog onSuccess={onRefresh} />
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="capitalize">{u.role}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <UserDialog user={u} onSuccess={onRefresh} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(u.id, u.name)}
                        disabled={deletingId === u.id}
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
