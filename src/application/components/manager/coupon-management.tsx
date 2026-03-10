"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Edit3, Percent, Plus, RefreshCw, Tag, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Coupon = {
  coupon_id: number;
  coupon_name: string;
  discount_percent: number | string;
  description: string | null;
};

type CouponFormState = {
  coupon_name: string;
  discount_percent: string;
  description: string;
};

const INITIAL_FORM_STATE: CouponFormState = {
  coupon_name: "",
  discount_percent: "",
  description: "",
};

export function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [formState, setFormState] = useState<CouponFormState>(INITIAL_FORM_STATE);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeDeleteId, setActiveDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadCoupons();
  }, []);

  async function loadCoupons() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/coupon", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load coupons");
      }

      setCoupons(result.data ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormState(INITIAL_FORM_STATE);
    setEditingCoupon(null);
  }

  function openCreateDialog() {
    resetForm();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(coupon: Coupon) {
    setEditingCoupon(coupon);
    setFormState({
      coupon_name: coupon.coupon_name,
      discount_percent: String(coupon.discount_percent),
      description: coupon.description ?? "",
    });
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsDialogOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        coupon_name: formState.coupon_name.trim(),
        discount_percent: Number(formState.discount_percent),
        description: formState.description.trim(),
      };

      if (!payload.coupon_name) {
        throw new Error("Coupon name is required");
      }

      if (Number.isNaN(payload.discount_percent) || payload.discount_percent < 0 || payload.discount_percent > 100) {
        throw new Error("Discount percent must be between 0 and 100");
      }

      const endpoint = editingCoupon ? `/api/coupon/${editingCoupon.coupon_id}` : "/api/coupon";
      const method = editingCoupon ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save coupon");
      }

      setSuccessMessage(editingCoupon ? "Coupon updated successfully." : "Coupon created successfully.");
      setIsDialogOpen(false);
      resetForm();
      await loadCoupons();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save coupon");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(coupon: Coupon) {
    const confirmed = window.confirm(`Delete coupon "${coupon.coupon_name}"?`);
    if (!confirmed) {
      return;
    }

    setActiveDeleteId(coupon.coupon_id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/coupon/${coupon.coupon_id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete coupon");
      }

      setSuccessMessage("Coupon deleted successfully.");
      await loadCoupons();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete coupon");
    } finally {
      setActiveDeleteId(null);
    }
  }

  const averageDiscount = coupons.length
    ? coupons.reduce((sum, coupon) => sum + Number(coupon.discount_percent), 0) / coupons.length
    : 0;

  return (
    <main className="flex-1">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-xl shadow-primary/5 backdrop-blur-sm">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_hsl(var(--secondary)/0.45),_transparent_35%)]" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary/70">Manager Console</p>
              <h1 className="font-mitr text-3xl text-foreground md:text-4xl">Coupon Management</h1>
            </div>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="w-full sm:w-auto">
                  <Plus />
                  Create Coupon
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCoupon ? "Edit coupon" : "Create coupon"}</DialogTitle>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="coupon_name">Coupon name</Label>
                    <Input
                      id="coupon_name"
                      value={formState.coupon_name}
                      onChange={(event) => setFormState((current) => ({ ...current, coupon_name: event.target.value }))}
                      placeholder="Weekend Relaxation"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_percent">Discount percent</Label>
                    <Input
                      id="discount_percent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formState.discount_percent}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, discount_percent: event.target.value }))
                      }
                      placeholder="15"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={formState.description}
                      onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Optional campaign details"
                      rows={4}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/60 bg-card/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Coupons</CardDescription>
              <CardTitle className="flex items-center gap-2 font-medium text-3xl">
                <Tag className="h-5 w-5 text-primary" />
                {coupons.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/60 bg-card/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription>Average Discount</CardDescription>
              <CardTitle className="flex items-center gap-2 font-medium text-3xl">
                <Percent className="h-5 w-5 text-primary" />
                {averageDiscount.toFixed(2)}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/60 bg-card/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription>Refresh Data</CardDescription>
              <CardTitle className="text-base font-medium text-muted-foreground">
                Sync the latest coupon list from Supabase.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => void loadCoupons()} disabled={isLoading}>
                <RefreshCw className={isLoading ? "animate-spin" : ""} />
                Refresh
              </Button>
            </CardContent>
          </Card>
        </section>

        {(errorMessage || successMessage) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              errorMessage
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-primary/20 bg-primary/10 text-foreground"
            }`}
          >
            {errorMessage ?? successMessage}
          </div>
        )}

        <Card className="overflow-hidden border-border/60 bg-card/80 shadow-lg shadow-primary/5 backdrop-blur-sm">
          <CardHeader className="border-b border-border/60 bg-muted/30">
            <CardTitle className="font-medium text-2xl">Coupon List</CardTitle>
            <CardDescription>Manage all available discounts for manager-facing campaigns.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex min-h-60 items-center justify-center p-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading coupons...
                </div>
              </div>
            ) : coupons.length === 0 ? (
              <div className="flex min-h-60 flex-col items-center justify-center gap-3 p-6 text-center">
                <Tag className="h-10 w-10 text-primary/60" />
                <div className="space-y-1">
                  <p className="font-medium">No coupons found</p>
                  <p className="text-sm text-muted-foreground">Create the first coupon to start running promotions.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border/60 text-sm">
                  <thead className="bg-muted/20 text-left text-muted-foreground">
                    <tr>
              
                      <th className="px-6 py-4 font-medium">Coupon Name</th>
                      <th className="px-6 py-4 font-medium">Discount</th>
                      <th className="px-6 py-4 font-medium">Description</th>
                      <th className="px-6 py-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {coupons.map((coupon) => (
                      <tr key={coupon.coupon_id} className="bg-background/60">
        
                        <td className="px-6 py-4 font-medium">{coupon.coupon_name}</td>
                        <td className="px-6 py-4">{Number(coupon.discount_percent).toFixed(2)}%</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {coupon.description?.trim() || "No description"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(coupon)}>
                              <Edit3 />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => void handleDelete(coupon)}
                              disabled={activeDeleteId === coupon.coupon_id}
                            >
                              <Trash2 />
                              {activeDeleteId === coupon.coupon_id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
