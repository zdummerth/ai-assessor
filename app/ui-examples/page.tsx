"use client";

import React, { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import BasicCombobox from "@/components/ui/comboboxes/basic";
import GroupedCombobox from "@/components/ui/comboboxes/grouped";
import InputInsidePopupCombobox from "@/components/ui/comboboxes/input-inside-popup";
import MultiSelectCombobox from "@/components/ui/comboboxes/multi-select";
import CreatableCombobox from "@/components/ui/comboboxes/creatable";
import AsyncSearchSingleCombobox from "@/components/ui/comboboxes/async-search-single";
import AsyncSearchMultiCombobox from "@/components/ui/comboboxes/async-search-multi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const cards = [
  {
    title: "Buttons & Badges",
    description: "Variants and sizes for quick actions and labeling.",
    content: (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">XS</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Icon button">
            <span className="text-lg">☆</span>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>
    ),
  },
  {
    title: "Form Inputs",
    description: "Inputs, textareas, labels, and checkboxes.",
    content: (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Ada Lovelace" />
          <Label htmlFor="bio">Short bio</Label>
          <Textarea id="bio" placeholder="Tell us a little about yourself" />
        </div>
        <div className="flex items-start gap-3 rounded-lg border p-4">
          <Checkbox id="updates" defaultChecked />
          <div className="space-y-1">
            <Label htmlFor="updates">Product updates</Label>
            <p className="text-sm text-muted-foreground">
              Receive occasional product news and early feature previews.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Tabs",
    description: "Horizontal tab navigation with two panels.",
    content: (
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Manage profile details, security, and notifications.
          </p>
        </TabsContent>
        <TabsContent value="billing" className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            View invoices, payment methods, and credits.
          </p>
        </TabsContent>
        <TabsContent value="usage" className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Track API calls, seats, and storage in real time.
          </p>
        </TabsContent>
      </Tabs>
    ),
  },
  {
    title: "Dropdown Menu",
    description: "Contextual actions with radio and checkbox items.",
    content: <DropdownExample />,
  },
  {
    title: "Dialogs",
    description: "Modal, alert, and sheet overlays.",
    content: <DialogShowcase />,
  },
  {
    title: "Command Palette",
    description: "Searchable command palette with grouping and shortcuts.",
    content: <CommandPaletteDemo />,
  },
  {
    title: "Carousel",
    description: "Keyboard-friendly carousel with custom controls.",
    content: <CarouselDemo />,
  },
  {
    title: "Toasts (Sonner)",
    description: "Trigger themed toasts for key statuses.",
    content: <ToastActions />,
  },
];

const comboboxes = [
  { title: "Basic", component: <BasicCombobox /> },
  { title: "Grouped", component: <GroupedCombobox /> },
  { title: "Input inside popup", component: <InputInsidePopupCombobox /> },
  { title: "Multi select", component: <MultiSelectCombobox /> },
  { title: "Creatable", component: <CreatableCombobox /> },
  { title: "Async search (single)", component: <AsyncSearchSingleCombobox /> },
  { title: "Async search (multi)", component: <AsyncSearchMultiCombobox /> },
];

export default function UIExamplesPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Component library
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            UI components and combobox examples
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground">
            Explore ready-to-use primitives with sensible styling. Each block
            below is wired to the live components so you can reference usage
            patterns quickly.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {cards.map((card) => (
            <Card key={card.title} className="h-full">
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>{card.content}</CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comboboxes</CardTitle>
            <CardDescription>
              Examples covering basic, grouped, embedded input, multi-select,
              creatable, and async search patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 md:grid-cols-2">
              {comboboxes.map((example) => (
                <div key={example.title} className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    {example.title}
                  </div>
                  <div className="rounded-lg border p-4">
                    {example.component}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function DropdownExample() {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(false);
  const [theme, setTheme] = useState("system");

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => toast("New file created")}>
            New file
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toast("Duplicate item")}>
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={notifyEmail}
            onCheckedChange={(checked) => setNotifyEmail(Boolean(checked))}
          >
            Email alerts
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={notifyPush}
            onCheckedChange={(checked) => setNotifyPush(Boolean(checked))}
          >
            Push notifications
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function DialogShowcase() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite team</DialogTitle>
            <DialogDescription>
              Share access with collaborators.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" placeholder="name@company.com" />
          </div>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete project</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>⚠️</AlertDialogMedia>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All data and connections will be
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open sheet</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>
              Fine-tune delivery channels for this workspace.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 p-4 pt-0">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-muted-foreground">
                  Weekly digests and important alerts.
                </p>
              </div>
              <Checkbox defaultChecked aria-label="Toggle email" />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Push</p>
                <p className="text-xs text-muted-foreground">
                  Real-time notifications to your device.
                </p>
              </div>
              <Checkbox aria-label="Toggle push" />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline">Dismiss</Button>
            <Button>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <Button onClick={() => setOpen(true)}>Open command palette</Button>
      <CommandDialog open={open} onOpenChange={setOpen} showCloseButton>
        <CommandInput placeholder="Search commands..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => toast("Jumped to dashboard")}>
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => toast("Opened billing")}>
              Billing
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => toast("Created a task")}>
              New task
            </CommandItem>
            <CommandItem onSelect={() => toast("Toggled dark mode")}>
              Toggle theme
            </CommandItem>
            <CommandItem onSelect={() => toast("Saved current view")}>
              Save view
              <CommandShortcut>Ctrl + S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

function CarouselDemo() {
  const slides = [
    {
      title: "Tasks",
      body: "Track work across teams with shared views.",
      tone: "bg-gradient-to-br from-blue-500 to-indigo-500",
    },
    {
      title: "Automations",
      body: "Automate handoffs with reliable triggers.",
      tone: "bg-gradient-to-br from-emerald-500 to-teal-500",
    },
    {
      title: "Insights",
      body: "Monitor metrics with live dashboards.",
      tone: "bg-gradient-to-br from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="relative">
      <Carousel className="w-full">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.title}>
              <div
                className={`flex h-48 items-center justify-between rounded-xl border p-6 text-white ${slide.tone}`}
              >
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{slide.title}</p>
                  <p className="max-w-md text-sm opacity-90">{slide.body}</p>
                </div>
                <Badge variant="outline" className="border-white/50 text-white">
                  Preview
                </Badge>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious aria-label="Previous slide" />
        <CarouselNext aria-label="Next slide" />
      </Carousel>
    </div>
  );
}

function ToastActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={() => toast.success("Changes saved")}>Success</Button>
      <Button
        variant="outline"
        onClick={() => toast.info("Heads up! Check the form")}
      >
        Info
      </Button>
      <Button
        variant="destructive"
        onClick={() => toast.error("Something went wrong")}
      >
        Error
      </Button>
      <Button variant="ghost" onClick={() => toast.loading("Working...")}>
        Loading
      </Button>
    </div>
  );
}
