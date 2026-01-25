"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createEmployee, updateEmployee, deleteEmployee } from "./actions";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  hire_date: string;
  termination_date: string | null;
  status: string;
  role: string;
}

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
}

function EmployeeForm({
  employee,
  onSuccess,
  onOpenChange,
}: EmployeeFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: employee?.first_name || "",
    last_name: employee?.last_name || "",
    email: employee?.email || "",
    hire_date: employee?.hire_date || new Date().toISOString().split("T")[0],
    status: employee?.status || "active",
    role: employee?.role || "member",
    termination_date: employee?.termination_date || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (employee) {
        const result = await updateEmployee(employee.id, formData);
        if (result.success) {
          toast.success("Employee updated");
          onOpenChange?.(false);
          onSuccess?.();
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await createEmployee(formData);
        if (result.success) {
          toast.success("Employee created");
          onOpenChange?.(false);
          onSuccess?.();
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            required
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            required
            value={formData.last_name}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hire_date">Hire Date</Label>
          <Input
            id="hire_date"
            type="date"
            required
            value={formData.hire_date}
            onChange={(e) =>
              setFormData({ ...formData, hire_date: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          >
            <option value="active">Active</option>
            <option value="leave">Leave</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        {formData.status === "terminated" && (
          <div className="space-y-2">
            <Label htmlFor="termination_date">Termination Date</Label>
            <Input
              id="termination_date"
              type="date"
              required
              value={formData.termination_date}
              onChange={(e) =>
                setFormData({ ...formData, termination_date: e.target.value })
              }
            />
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange?.(false)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : employee ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface EmployeesListProps {
  employees: Employee[];
  onRefresh: () => void;
}

function EmployeesList({ employees, onRefresh }: EmployeesListProps) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteEmployee(id);
      if (result.success) {
        toast.success("Employee deleted");
        setDeletingId(null);
        onRefresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete employee");
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Hire Date</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-muted/50">
                <td className="p-3">{`${emp.first_name} ${emp.last_name}`}</td>
                <td className="p-3 text-muted-foreground">
                  {emp.email || "—"}
                </td>
                <td className="p-3">{emp.hire_date}</td>
                <td className="p-3 capitalize">{emp.status}</td>
                <td className="p-3 capitalize">{emp.role}</td>
                <td className="p-3 flex gap-2">
                  <Dialog
                    open={isFormOpen && editingEmployee?.id === emp.id}
                    onOpenChange={setIsFormOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingEmployee(emp);
                          setIsFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                        <DialogDescription>
                          Update employee details
                        </DialogDescription>
                      </DialogHeader>
                      <EmployeeForm
                        employee={editingEmployee || undefined}
                        onSuccess={onRefresh}
                        onOpenChange={setIsFormOpen}
                      />
                    </DialogContent>
                  </Dialog>

                  <AlertDialog
                    open={deletingId === emp.id}
                    onOpenChange={(open) => !open && setDeletingId(null)}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeletingId(emp.id)}
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete employee?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete {emp.first_name}{" "}
                          {emp.last_name}. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => handleDelete(emp.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No employees yet
        </div>
      )}
    </div>
  );
}

export default function EmployeesCrudUI() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const fetchEmployees = React.useCallback(async () => {
    try {
      const { getEmployees } = await import("./actions");
      const result = await getEmployees(100);
      if (result.data) {
        setEmployees(result.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Employees</CardTitle>
          <CardDescription>Manage employee records and roles</CardDescription>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>Add Employee</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Employee</DialogTitle>
              <DialogDescription>
                Add a new employee to the system
              </DialogDescription>
            </DialogHeader>
            <EmployeeForm
              onSuccess={fetchEmployees}
              onOpenChange={setIsFormOpen}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        ) : (
          <EmployeesList employees={employees} onRefresh={fetchEmployees} />
        )}
      </CardContent>
    </Card>
  );
}
