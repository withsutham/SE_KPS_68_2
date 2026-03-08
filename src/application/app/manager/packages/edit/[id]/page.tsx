"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { use } from "react";

interface Massage {
    massage_id: string;
    massage_name: string;
    massage_price: number;
    massage_time: number;
}

interface SelectedMassage extends Massage {
    uniqueId: string; // for React keys
}

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const packageId = resolvedParams.id;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form inputs
    const [packageName, setPackageName] = useState("");
    const [packagePrice, setPackagePrice] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Massages
    const [availableMassages, setAvailableMassages] = useState<Massage[]>([]);
    const [selectedMassages, setSelectedMassages] = useState<SelectedMassage[]>([]);

    useEffect(() => {
        if (packageId) {
            fetchInitialData();
        }
    }, [packageId]);

    async function fetchInitialData() {
        setLoading(true);
        try {
            // 1. Fetch available massages
            const massageRes = await fetch("/api/massage");
            const massageJson = await massageRes.json();
            if (massageJson.success) {
                setAvailableMassages(massageJson.data || []);
            }

            // 2. Fetch specific package
            const pkgRes = await fetch(`/api/package/${packageId}`);
            const pkgJson = await pkgRes.json();

            if (pkgJson.success && pkgJson.data) {
                const pkg = pkgJson.data;
                setPackageName(pkg.package_name);
                setPackagePrice(pkg.package_price.toString());
                setStartDate(pkg.campaign_start_datetime ? pkg.campaign_start_datetime.split("T")[0] : "");
                setEndDate(pkg.campaign_end_datetime ? pkg.campaign_end_datetime.split("T")[0] : "");
            }

            // 3. Fetch package details to populate selected massages
            // Since we updated GET /api/package to include package_detail, we can fetch from there
            // const allPkgRes = await fetch("/api/package");
            // const allPkgJson = await allPkgRes.json();

            // if (allPkgJson.success) {
            //     const currentPackage = allPkgJson.data.find((p: any) => p.package_id === packageId);

            //     if (currentPackage && currentPackage.package_detail) {
            //         const loadedMassages = currentPackage.package_detail.map((detail: any) => ({
            //             massage_id: detail.massage.massage_id,
            //             massage_name: detail.massage.massage_name,
            //             massage_price: detail.massage.massage_price,
            //             massage_time: detail.massage.massage_time,
            //             uniqueId: Math.random().toString(36).substring(2, 9)
            //         }));
            //         setSelectedMassages(loadedMassages);
            //     }
            // }

            if (pkgJson.success && pkgJson.data) { //add
                const pkg = pkgJson.data;

                setPackageName(pkg.package_name);
                setPackagePrice(pkg.package_price.toString());
                setStartDate(pkg.campaign_start_datetime ? pkg.campaign_start_datetime.split("T")[0] : "");
                setEndDate(pkg.campaign_end_datetime ? pkg.campaign_end_datetime.split("T")[0] : "");

                // ✅ โหลด massages ที่อยู่ใน package
                if (pkg.package_detail) {
                    const loadedMassages = pkg.package_detail.map((detail: any) => ({
                        massage_id: detail.massage.massage_id,
                        massage_name: detail.massage.massage_name,
                        massage_price: detail.massage.massage_price,
                        massage_time: detail.massage.massage_time,
                        uniqueId: Math.random().toString(36).substring(2, 9)
                    }));

                    setSelectedMassages(loadedMassages);
                }
            }

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
            uniqueId: Math.random().toString(36).substring(2, 9)
        };
        setSelectedMassages([...selectedMassages, newSelection]);
    }


    function removeMassageFromPackage(uniqueId: string) {
        setSelectedMassages(selectedMassages.filter(m => m.uniqueId !== uniqueId));
    }

    // Calculations
    const totalTime = selectedMassages.reduce((sum, m) => sum + m.massage_time, 0);
    const totalPriceOfMassages = selectedMassages.reduce((sum, m) => sum + m.massage_price, 0);

    async function handleSavePackage(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 1. Update Package
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

            // 2. Overwrite Package Details
            // Step 2a: Delete all old details
            await fetch(`/api/package_detail/by-package/${packageId}`, {
                method: "DELETE",
            });

            // Step 2b: Insert new details
            if (selectedMassages.length > 0) {
                const detailsPayload = selectedMassages.map((sm) => ({
                    package_id: packageId,
                    massage_id: sm.massage_id
                }));

                const detailsRes = await fetch("/api/package_detail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(detailsPayload),
                });

                if (!detailsRes.ok) {
                    console.error("Failed to insert new package details");
                }
            }

            // Success, back to list
            router.push("/manager/packages");

        } catch (error) {
            console.error("Error updating package:", error);
            alert("Unexpected error occurred.");
            setSubmitting(false);
        }
    }

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="p-8 max-w-6xl mx-auto flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Edit Package</h1>
                <Button variant="outline" onClick={() => router.push("/manager/packages")}>
                    Back to List
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Form Info */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-fit">
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
                                Recommendation: Total price of individual massages is ฿{totalPriceOfMassages.toLocaleString()}
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
                    </form>
                </div>

                {/* Right Column: Massage Selection */}
                <div className="flex flex-col gap-6">
                    {/* Selected Massages Summary */}
                    <div className="bg-emerald-50 p-6 rounded-lg shadow-sm border border-emerald-100">
                        <h3 className="text-lg font-semibold text-emerald-800 mb-4">Included Massages in Package</h3>

                        {selectedMassages.length === 0 ? (
                            <p className="text-emerald-600/60 italic text-sm text-center py-4 bg-white/50 rounded-md">
                                No massages added yet. Select from the list below.
                            </p>
                        ) : (
                            <>
                                <ul className="space-y-2 mb-4 max-h-[300px] overflow-y-auto pr-2">
                                    {selectedMassages.map((sm, idx) => (
                                        <li key={sm.uniqueId} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border border-emerald-100/50">
                                            <div className="flex items-center gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-emerald-950">{sm.massage_name}</p>
                                                    <p className="text-xs text-emerald-600">{sm.massage_time} mins | ฿{sm.massage_price}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeMassageFromPackage(sm.uniqueId)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                ✕
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
                                        <p className="text-2xl font-bold">฿{totalPriceOfMassages.toLocaleString()}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Available Massages to Pick */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <h3 className="text-xl font-semibold mb-4">Available Massages</h3>
                        {/* List available massages */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                            {availableMassages.map((massage) => (
                                <div key={massage.massage_id} className="flex justify-between items-center p-3 border rounded-lg hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors">
                                    <div>
                                        <p className="font-medium text-sm">{massage.massage_name}</p>
                                        <p className="text-xs text-gray-500">{massage.massage_time} min | ฿{massage.massage_price}</p>
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
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-4 mt-4 pt-6 border-t">
                <Button variant="outline" onClick={() => router.push("/manager/packages")} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="edit-package-form"
                    className="min-w-[150px]"
                    disabled={submitting || selectedMassages.length === 0}
                >
                    {submitting ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
