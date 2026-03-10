"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface Massage {
    massage_id: string;
    massage_name: string;
    massage_price: number;
    massage_time: number;
}

interface SelectedMassage extends Massage {
    uniqueId: string; // for React keys when allowing duplicates
}

export default function CreatePackagePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form inputs
    const [packageName, setPackageName] = useState("");
    const [packagePrice, setPackagePrice] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Massages
    const [availableMassages, setAvailableMassages] = useState<Massage[]>([]);
    const [selectedMassages, setSelectedMassages] = useState<SelectedMassage[]>([]);
    const [massageSearchTerm, setMassageSearchTerm] = useState("");

    useEffect(() => {
        setSubmitting(false);
        fetchMassages();
    }, []);

    async function fetchMassages() {
        setLoading(true);
        try {
            const res = await fetch("/api/massage");
            const json = await res.json();
            if (json.success) {
                setAvailableMassages(json.data || []);
            } else {
                console.error("Failed to fetch massages:", json.error);
            }
        } catch (error) {
            console.error("Error fetching massages:", error);
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
    const normalizedMassageSearchTerm = massageSearchTerm.trim().toLowerCase();
    const filteredAvailableMassages = availableMassages.filter((massage) =>
        massage.massage_name.toLowerCase().includes(normalizedMassageSearchTerm),
    );

    async function handleSavePackage(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            // 1. Create Package
            const packagePayload = {
                package_name: packageName,
                package_price: Number(packagePrice),
                campaign_start_datetime: startDate || null,
                campaign_end_datetime: endDate || null,
            };

            const packageRes = await fetch("/api/package", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(packagePayload),
            });
            
            const packageJson = await packageRes.json();
            
            if (!packageRes.ok || !packageJson.success) {
                alert("Error creating package: " + (packageJson.error || "Unknown error"));
                setSubmitting(false);
                return;
            }

            const newPackageId = packageJson.data.package_id;

            // 2. Create Package Details
            if (selectedMassages.length > 0) {
                // Prepare details payload
                // The API needs to handle array inserts, or we insert individually.
                // Assuming standard supabase insert accepts arrays
                const detailsPayload = selectedMassages.map((sm) => ({
                    package_id: newPackageId,
                    massage_id: sm.massage_id
                }));

                const detailsRes = await fetch("/api/package_detail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(detailsPayload),
                });

                if (!detailsRes.ok) {
                    // Note: If this fails, package is created but empty. 
                    // Production ready code would use transactions via Supabase RPC.
                    console.error("Failed to insert package details");
                }
            }

            // Success, back to list
            router.push("/manager/package");

        } catch (error) {
            console.error("Error saving package:", error);
            alert("Unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 p-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Create New Package</h1>
                <Button variant="outline" onClick={() => router.push("/manager/package")}>
                    Back to List
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Form Info */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-fit min-w-0">
                    <h3 className="text-xl font-semibold mb-6">Package Details</h3>
                    
                    <form id="create-package-form" onSubmit={handleSavePackage} className="space-y-4">
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

                        <div className="flex justify-start gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.push("/manager/package")} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="create-package-form"
                                className="min-w-[150px]"
                                disabled={submitting || selectedMassages.length === 0}
                            >
                                {submitting ? "Saving..." : "Save Package"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Massage Selection */}
                <div className="flex min-w-0 flex-col gap-6">
                    {/* Selected Massages Summary */}
                    <div className="bg-emerald-50 p-6 rounded-lg shadow-sm border border-emerald-100 min-w-0">
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
                        {loading ? (
                            <p className="text-gray-500 text-center py-4">Loading...</p>
                        ) : filteredAvailableMassages.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No massages match your search.</p>
                        ) : (
                            <div className="grid min-w-0 grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                                {filteredAvailableMassages.map((massage) => (
                                    <div key={massage.massage_id} className="flex min-w-0 justify-between items-center p-3 border rounded-lg hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors">
                                        <div className="min-w-0">
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
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
