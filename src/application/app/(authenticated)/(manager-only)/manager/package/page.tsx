"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    const pathname = usePathname();
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        setSearchTerm("");
    }, [pathname]);

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

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const filteredPackages = packages.filter((pkg) => {
        if (!normalizedSearchTerm) return true;

        const matchesPackageName = pkg.package_name.toLowerCase().includes(normalizedSearchTerm);
        const matchesMassageName = (pkg.package_detail || []).some((detail) =>
            detail.massage?.massage_name?.toLowerCase().includes(normalizedSearchTerm),
        );

        return matchesPackageName || matchesMassageName;
    });

    return (
        <div className="w-full min-w-0 max-w-5xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Package Management</h1>
                <Link href="/manager/package/create">
                    <Button>+ Create New Package</Button>
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 w-full min-w-0">
                <div className="flex min-w-0 flex-col gap-4 mb-4">
                    <h3 className="text-xl font-semibold">Packages List</h3>
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by package name or massage name"
                        className="w-full min-w-0 max-w-md"
                    />
                </div>
                
                {loading ? (
                    <p className="text-gray-500 text-center py-8">Loading packages...</p>
                ) : packages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No packages found.</p>
                ) : filteredPackages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No packages match your search.</p>
                ) : (
                    <div className="w-full min-w-0 overflow-x-auto">
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
                                {filteredPackages.map((pkg) => (
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
                                                <Link href={`/manager/package/edit/${pkg.package_id}`}>
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                </Link>
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
