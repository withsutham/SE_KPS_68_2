"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Massage {
    massage_id: string;
    massage_name: string;
    massage_price: number;
    massage_time: number;
}

interface PackageDetail {
    massage: Massage | null;
}

interface PackageRecord {
    package_name: string;
    package_price: number;
    campaign_start_datetime: string | null;
    campaign_end_datetime: string | null;
    package_detail?: PackageDetail[];
}

interface SelectedMassage extends Massage {
    uniqueId: string;
}

function createUniqueId() {
    return Math.random().toString(36).substring(2, 9);
}

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const packageId = resolvedParams.id;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [packageName, setPackageName] = useState("");
    const [packagePrice, setPackagePrice] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [availableMassages, setAvailableMassages] = useState<Massage[]>([]);
    const [selectedMassages, setSelectedMassages] = useState<SelectedMassage[]>([]);
    const [massageSearchTerm, setMassageSearchTerm] = useState("");

    useEffect(() => {
        if (packageId) {
            setSubmitting(false);
            void fetchInitialData();
        }
    }, [packageId]);

    async function fetchInitialData() {
        setLoading(true);
        try {
            const massageRes = await fetch("/api/massage");
            const massageJson = await massageRes.json();
            if (massageJson.success) {
                setAvailableMassages(massageJson.data || []);
            }

            const pkgRes = await fetch(`/api/package/${packageId}`);
            const pkgJson = await pkgRes.json();

            if (!pkgRes.ok || !pkgJson.success || !pkgJson.data) {
                throw new Error(pkgJson.error || "Failed to load package");
            }

            const pkg = pkgJson.data as PackageRecord;
            setPackageName(pkg.package_name);
            setPackagePrice(pkg.package_price.toString());
            setStartDate(pkg.campaign_start_datetime ? pkg.campaign_start_datetime.split("T")[0] : "");
            setEndDate(pkg.campaign_end_datetime ? pkg.campaign_end_datetime.split("T")[0] : "");

            const loadedMassages = (pkg.package_detail || [])
                .map((detail) => detail.massage)
                .filter((massage): massage is Massage => Boolean(massage))
                .map((massage) => ({
                    ...massage,
                    uniqueId: createUniqueId(),
                }));

            setSelectedMassages(loadedMassages);
        } catch (error) {
            console.error("Error fetching initial data:", error);
            alert("Failed to load package data");
        } finally {
            setLoading(false);
        }
    }

    function addMassageToPackage(massage: Massage) {
        const newSelection: SelectedMassage = {
            ...massage,
            uniqueId: createUniqueId(),
        };
        setSelectedMassages([...selectedMassages, newSelection]);
    }

    function removeMassageFromPackage(uniqueId: string) {
        setSelectedMassages(selectedMassages.filter((massage) => massage.uniqueId !== uniqueId));
    }

    const totalTime = selectedMassages.reduce((sum, massage) => sum + massage.massage_time, 0);
    const totalPriceOfMassages = selectedMassages.reduce((sum, massage) => sum + massage.massage_price, 0);
    const normalizedMassageSearchTerm = massageSearchTerm.trim().toLowerCase();
    const filteredAvailableMassages = availableMassages.filter((massage) =>
        massage.massage_name.toLowerCase().includes(normalizedMassageSearchTerm),
    );

    async function handleSavePackage(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        try {
            const packagePayload = {
                package_name: packageName,
                package_price: Number(packagePrice),
                campaign_start_datetime: startDate || null,
                campaign_end_datetime: endDate || null,
            };

            const packageRes = await fetch(`/api/package/${packageId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(packagePayload),
            });

            if (!packageRes.ok) {
                const err = await packageRes.json();
                alert("Error updating package: " + err.error);
                setSubmitting(false);
                return;
            }

            const deleteDetailsRes = await fetch(`/api/package_detail/by-package/${packageId}`, {
                method: "DELETE",
            });

            if (!deleteDetailsRes.ok) {
                const err = await deleteDetailsRes.json();
                alert("Error clearing package massages: " + (err.error || "Unknown error"));
                setSubmitting(false);
                return;
            }

            if (selectedMassages.length > 0) {
                const detailsPayload = selectedMassages.map((massage) => ({
                    package_id: packageId,
                    massage_id: massage.massage_id,
                }));

                const detailsRes = await fetch("/api/package_detail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(detailsPayload),
                });

                if (!detailsRes.ok) {
                    const err = await detailsRes.json();
                    alert("Error updating package massages: " + (err.error || "Unknown error"));
                    setSubmitting(false);
                    return;
                }
            }

            router.push("/manager/package");
        } catch (error) {
            console.error("Error updating package:", error);
            alert("Unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 p-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Edit Package</h1>
                <Button variant="outline" onClick={() => router.push("/manager/package")}>
                    Back to List
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-fit min-w-0">
                    <h3 className="text-xl font-semibold mb-6">Package Details</h3>

                    <form id="edit-package-form" onSubmit={handleSavePackage} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="packageName">Package Name</Label>
                            <Input
                                id="packageName"
                                placeholder="e.g. Premium Spa 2 Hours"
                                value={packageName}
                                onChange={(e) => setPackageName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="packagePrice">Package Selling Price (THB)</Label>
                            <Input
                                id="packagePrice"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={packagePrice}
                                onChange={(e) => setPackagePrice(e.target.value)}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Recommendation: Total price of individual massages is THB {totalPriceOfMassages.toLocaleString()}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Campaign Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">Campaign End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-start gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.push("/manager/package")} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="edit-package-form"
                                className="min-w-[150px]"
                                disabled={submitting}
                            >
                                {submitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="flex min-w-0 flex-col gap-6">
                    <div className="bg-emerald-50 p-6 rounded-lg shadow-sm border border-emerald-100 min-w-0">
                        <h3 className="text-lg font-semibold text-emerald-800 mb-4">Included Massages in Package</h3>

                        {selectedMassages.length === 0 ? (
                            <p className="text-emerald-600/60 italic text-sm text-center py-4 bg-white/50 rounded-md">
                                No massages added yet. Select from the list below.
                            </p>
                        ) : (
                            <>
                                <ul className="space-y-2 mb-4 max-h-[300px] overflow-y-auto pr-2">
                                    {selectedMassages.map((massage, idx) => (
                                        <li key={massage.uniqueId} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border border-emerald-100/50">
                                            <div className="flex items-center gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-emerald-950">{massage.massage_name}</p>
                                                    <p className="text-xs text-emerald-600">{massage.massage_time} mins | THB {massage.massage_price}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeMassageFromPackage(massage.uniqueId)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                X
                                            </Button>
                                        </li>
                                    ))}
                                </ul>

                                <div className="border-t border-emerald-200 pt-4 flex justify-between items-end">
                                    <div className="text-emerald-800">
                                        <p className="text-sm">Total Duration:</p>
                                        <p className="text-2xl font-bold">{totalTime} <span className="text-base font-normal">mins</span></p>
                                    </div>
                                    <div className="text-emerald-800 text-right">
                                        <p className="text-sm">Individual Total Value:</p>
                                        <p className="text-2xl font-bold">THB {totalPriceOfMassages.toLocaleString()}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 min-w-0">
                        <div className="flex min-w-0 flex-col gap-4 mb-4">
                            <h3 className="text-xl font-semibold">Available Massages</h3>
                            <Input
                                value={massageSearchTerm}
                                onChange={(e) => setMassageSearchTerm(e.target.value)}
                                placeholder="Search massage name"
                                className="w-full min-w-0"
                            />
                        </div>
                        {filteredAvailableMassages.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No massages match your search.</p>
                        ) : (
                            <div className="grid min-w-0 grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                            {filteredAvailableMassages.map((massage) => (
                                <div key={massage.massage_id} className="flex min-w-0 justify-between items-center p-3 border rounded-lg hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors">
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm">{massage.massage_name}</p>
                                        <p className="text-xs text-gray-500">{massage.massage_time} min | THB {massage.massage_price}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => addMassageToPackage(massage)}
                                    >
                                        + Add
                                    </Button>
                                </div>
                            ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
