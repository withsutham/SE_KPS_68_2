"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Package {
    package_id: string;
    package_name: string;
    package_price: number;
    campaign_start_datetime: string | null;
    campaign_end_datetime: string | null;
    package_detail?: {
        massage: {
            massage_name: string;
            massage_id: string;
            massage_price: number;
            massage_time: number;
        };
    }[];
}

export default function PackagePage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [packageName, setPackageName] = useState("");
    const [packagePrice, setPackagePrice] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchPackages();
    }, []);

    async function fetchPackages() {
        setLoading(true);
        try {
            const res = await fetch("/api/package");
            const json = await res.json();
            if (json.success) {
                setPackages(json.data || []);
            } else {
                console.error("Failed to fetch packages:", json.error);
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSavePackage(e: React.FormEvent) {
        e.preventDefault();
        
        const payload = {
            package_name: packageName,
            package_price: Number(packagePrice),
            campaign_start_datetime: startDate || null,
            campaign_end_datetime: endDate || null,
        };

        try {
            if (isEditing && editId) {
                // Update
                const res = await fetch(`/api/package/${editId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (res.ok) {
                    resetForm();
                    fetchPackages();
                } else {
                    const errorJson = await res.json();
                    alert("Error updating package: " + errorJson.error);
                }
            } else {
                // Create
                const res = await fetch("/api/package", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (res.ok) {
                    resetForm();
                    fetchPackages();
                } else {
                    const errorJson = await res.json();
                    alert("Error adding package: " + errorJson.error);
                }
            }
        } catch (error) {
            console.error("Error saving package:", error);
        }
    }

    async function deletePackage(id: string) {
        if (!confirm("Are you sure you want to delete this package?")) return;

        try {
            const res = await fetch(`/api/package/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchPackages();
            } else {
                const errorJson = await res.json();
                alert("Error deleting package: " + errorJson.error);
            }
        } catch (error) {
            console.error("Error deleting package:", error);
        }
    }

    function editPackage(pkg: Package) {
        setIsEditing(true);
        setEditId(pkg.package_id);
        setPackageName(pkg.package_name);
        setPackagePrice(pkg.package_price.toString());
        setStartDate(pkg.campaign_start_datetime ? pkg.campaign_start_datetime.split("T")[0] : ""); // basic format
        setEndDate(pkg.campaign_end_datetime ? pkg.campaign_end_datetime.split("T")[0] : "");
    }

    function resetForm() {
        setIsEditing(false);
        setEditId(null);
        setPackageName("");
        setPackagePrice("");
        setStartDate("");
        setEndDate("");
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Package Management</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">
                    {isEditing ? "Edit Package" : "Add New Package"}
                </h3>
                
                <form onSubmit={handleSavePackage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="packageName">Package Name</Label>
                        <Input
                            id="packageName"
                            placeholder="e.g. Premium Spa"
                            value={packageName}
                            onChange={(e) => setPackageName(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="packagePrice">Price (THB)</Label>
                        <Input
                            id="packagePrice"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={packagePrice}
                            onChange={(e) => setPackagePrice(e.target.value)}
                            required
                        />
                    </div>

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

                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                        {isEditing && (
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Cancel
                            </Button>
                        )}
                        <Button type="submit">
                            {isEditing ? "Update Package" : "Add Package"}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">Packages List</h3>
                
                {loading ? (
                    <p className="text-gray-500 text-center py-8">Loading packages...</p>
                ) : packages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No packages found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b text-gray-600 bg-gray-50">
                                    <th className="py-3 px-4 rounded-tl-lg">Name</th>
                                    <th className="py-3 px-4">Price</th>
                                    <th className="py-3 px-4">Massages Include</th>
                                    <th className="py-3 px-4">Campaign Period</th>
                                    <th className="py-3 px-4 text-right rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.map((pkg) => (
                                    <tr key={pkg.package_id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium">{pkg.package_name}</td>
                                        <td className="py-3 px-4 text-emerald-600 font-semibold">
                                            ฿{pkg.package_price.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            {pkg.package_detail && pkg.package_detail.length > 0 ? (
                                                <ul className="list-disc list-inside text-sm text-gray-600">
                                                    {pkg.package_detail.map((detail, idx) => (
                                                        <li key={idx}>
                                                            {detail.massage?.massage_name || "Unknown Massage"} 
                                                            <span className="text-gray-400 text-xs ml-1">
                                                                ({detail.massage?.massage_time || 0} min)
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">No massages added</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {pkg.campaign_start_datetime || pkg.campaign_end_datetime ? (
                                                <>
                                                    {pkg.campaign_start_datetime ? new Date(pkg.campaign_start_datetime).toLocaleDateString() : 'Now'} 
                                                    {" - "} 
                                                    {pkg.campaign_end_datetime ? new Date(pkg.campaign_end_datetime).toLocaleDateString() : 'Forever'}
                                                </>
                                            ) : (
                                                <span className="text-gray-400 italic">No period</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => editPackage(pkg)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    onClick={() => deletePackage(pkg.package_id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}