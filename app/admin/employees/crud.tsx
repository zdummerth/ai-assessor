"use client";

import React, { useState, useActionState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  createEmployee,
  updateEmployee,
  deleteEmployees,
  type ActionState,
} from "./actions";

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
  const action = employee ? updateEmployee : createEmployee;
  const [state, formAction, pending] = useActionState<
    ActionState | null,
    FormData
  >(action, null);
  const [formData, setFormData] = useState({
    first_name: employee?.first_name || "",
    last_name: employee?.last_name || "",
    email: employee?.email || "",
    hire_date: employee?.hire_date || new Date().toISOString().split("T")[0],
    status: employee?.status || "active",
    role: employee?.role || "member",
    termination_date: employee?.termination_date || "",
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onOpenChange?.(false);
      onSuccess?.();
    } else if (state && !state.success) {
      toast.error(state.message);
    }
  }, [state, onSuccess, onOpenChange]);

  return (
    <form action={formAction} className="space-y-4">
      {employee && <input type="hidden" name="id" value={employee.id} />}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            name="first_name"
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
            name="last_name"
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
          name="email"
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
            name="hire_date"
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
            name="status"
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
            name="role"
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
              name="termination_date"
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
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : employee ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface EmployeesListProps {
  employees: Employee[];
  onRefresh?: () => void;
}

function EmployeesList({ employees, onRefresh }: EmployeesListProps) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [deleteState, deleteAction, deletePending] = useActionState<
    ActionState | null,
    FormData
  >(deleteEmployees, null);

  useEffect(() => {
    if (deleteState?.success) {
      toast.success(deleteState.message);
      setDeletingId(null);
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
      onRefresh?.();
    } else if (deleteState && !deleteState.success) {
      toast.error(deleteState.message);
    }
  }, [deleteState, onRefresh]);

  const toggleSelectAll = () => {
    if (selectedIds.length === employees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map((emp) => emp.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} selected
          </span>
          <AlertDialog
            open={isBulkDeleteOpen}
            onOpenChange={setIsBulkDeleteOpen}
          >
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                Delete Selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <form action={deleteAction}>
                <input
                  type="hidden"
                  name="ids"
                  value={JSON.stringify(selectedIds)}
                />
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {selectedIds.length} employee
                    {selectedIds.length > 1 ? "s" : ""}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the selected employees. This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={deletePending}
                  >
                    {deletePending ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">
                <Checkbox
                  checked={
                    selectedIds.length === employees.length &&
                    employees.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>
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
                <td className="p-3">
                  <Checkbox
                    checked={selectedIds.includes(emp.id)}
                    onCheckedChange={() => toggleSelect(emp.id)}
                    aria-label={`Select ${emp.first_name} ${emp.last_name}`}
                  />
                </td>
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
                      <form action={deleteAction}>
                        <input
                          type="hidden"
                          name="ids"
                          value={JSON.stringify([emp.id])}
                        />
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete employee?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {emp.first_name}{" "}
                            {emp.last_name}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <Button
                            type="submit"
                            variant="destructive"
                            disabled={deletePending}
                          >
                            {deletePending ? "Deleting..." : "Delete"}
                          </Button>
                        </AlertDialogFooter>
                      </form>
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

export default function EmployeesCrudUI({ employees }: EmployeesListProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);

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
            <EmployeeForm onOpenChange={setIsFormOpen} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <EmployeesList employees={employees} />
      </CardContent>
    </Card>
  );
}
