"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { count } from "console"

export default function PackagePage() {

    const supabase = createClient()

    const [packages, setPackages] = useState<any[]>([])
    const [package_id, setPackage_id] = useState("")
    const [package_name, setPackage_name] = useState("")
    const [package_price, setPackage_price] = useState("")
    const [campaign_start_datetime, setCampaign_start_datetime] = useState("")
    const [campaign_end_datetime, setCampaign_end_datetime] = useState("")

    const [name, setName] = useState("")
    const [price, setPrice] = useState("")

    useEffect(() => {
        fetchPackages()
    }, [])

    async function fetchPackages() {

        const { data } = await supabase
            .from("package")
            .select(`
                        package_id,
                        package_name,
                        package_price,
                        package_massages(
                        massage(
                            massage_name,
                            massage_id,
                            massage_price,
                            massage_time
                        )
                        )
                    `)

        setPackages(data || [])
    }

    //======================= edit package ================// 


    async function addPackage() {

        await supabase
            .from("packages")
            .insert([{ name, price }])

        fetchPackages()

        setName("")
        setPrice("")
    }

    async function deletePackage(id: number) {

        await supabase
            .from("packages")
            .delete()
            .eq("id", id)

        fetchPackages()
    }

    return (

        <div style={{ padding: 40 }}>

            <h1>Package Management</h1>

            <h3>Add Package</h3>

            <input
                placeholder="Package name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />

            <button onClick={addPackage}>
                Add
            </button>

            <hr />

            <h3>Packages</h3>

            {packages.map((pkg: any) => (

                <div key={pkg.id}>

                    {pkg.name} - {pkg.price}

                    <button
                        onClick={() => deletePackage(pkg.id)}
                    >
                        Delete
                    </button>

                </div>

            ))}

        </div>
    )
}