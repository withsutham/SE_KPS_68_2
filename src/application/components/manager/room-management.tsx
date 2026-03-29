"use client";

import { useEffect, useState, useCallback } from "react";
import { 
    DoorOpen, 
    Plus, 
    Search, 
    RefreshCw, 
    Edit2, 
    Trash2, 
    AlertCircle, 
    CheckCircle2,
    Settings2,
    X,
    Save,
    Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// --- Types ---

interface Room {
    room_id: number;
    room_name: string;
}

interface Massage {
    massage_id: number;
    massage_name: string;
}

interface RoomMassage {
    room_massage_id: number;
    room_id: number;
    massage_id: number;
    capacity: number;
}

// --- Component ---

export function RoomManagement() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [massages, setMassages] = useState<Massage[]>([]);
    const [roomMassages, setRoomMassages] = useState<RoomMassage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Dialog States
    const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
    const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
    const [isManageServicesOpen, setIsManageServicesOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [newRoomName, setNewRoomName] = useState("");
    const [editRoomName, setEditRoomName] = useState("");
    
    // Room-Massage Link States
    const [linkingCapacity, setLinkingCapacity] = useState(1);
    const [linkingMassageId, setLinkingMassageId] = useState<number | "">("");

    const [isActionLoading, setIsActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // --- Data Fetching ---

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [roomsRes, massagesRes, roomMassagesRes] = await Promise.all([
                fetch("/api/room"),
                fetch("/api/massage"),
                fetch("/api/room_massage")
            ]);

            const [roomsJson, massagesJson, roomMassagesJson] = await Promise.all([
                roomsRes.json(),
                massagesRes.json(),
                roomMassagesRes.json()
            ]);

            if (roomsJson.success) setRooms(roomsJson.data);
            if (massagesJson.success) setMassages(massagesJson.data);
            if (roomMassagesJson.success) setRoomMassages(roomMassagesJson.data);
        } catch (error) {
            setErrorMessage("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Actions ---

    const handleAddRoom = async () => {
        if (!newRoomName.trim()) return;
        setIsActionLoading(true);
        try {
            const res = await fetch("/api/room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room_name: newRoomName })
            });
            const json = await res.json();
            if (json.success) {
                setSuccessMessage("Room added successfully");
                setNewRoomName("");
                setIsAddRoomOpen(false);
                fetchData();
            } else {
                setErrorMessage(json.error);
            }
        } catch {
            setErrorMessage("Failed to add room");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUpdateRoom = async () => {
        if (!selectedRoom || !editRoomName.trim()) return;
        setIsActionLoading(true);
        try {
            const res = await fetch(`/api/room/${selectedRoom.room_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room_name: editRoomName })
            });
            const json = await res.json();
            if (json.success) {
                setSuccessMessage("Room updated successfully");
                setIsEditRoomOpen(false);
                fetchData();
            } else {
                setErrorMessage(json.error);
            }
        } catch {
            setErrorMessage("Failed to update room");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteRoom = async () => {
        if (!selectedRoom) return;
        setIsActionLoading(true);
        try {
            const res = await fetch(`/api/room/${selectedRoom.room_id}`, {
                method: "DELETE"
            });
            const json = await res.json();
            if (json.success) {
                setSuccessMessage("Room deleted successfully");
                setIsDeleteConfirmOpen(false);
                fetchData();
            } else {
                setErrorMessage(json.error);
            }
        } catch {
            setErrorMessage("Failed to delete room");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleAddServiceLink = async () => {
        if (!selectedRoom || !linkingMassageId) return;
        setIsActionLoading(true);
        try {
            const res = await fetch("/api/room_massage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room_id: selectedRoom.room_id,
                    massage_id: Number(linkingMassageId),
                    capacity: linkingCapacity
                })
            });
            const json = await res.json();
            if (json.success) {
                setSuccessMessage("Service linked successfully");
                setLinkingMassageId("");
                setLinkingCapacity(1);
                fetchData();
            } else {
                setErrorMessage(json.error);
            }
        } catch {
            setErrorMessage("Failed to link service");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRemoveServiceLink = async (id: number) => {
        setIsActionLoading(true);
        try {
            const res = await fetch(`/api/room_massage/${id}`, {
                method: "DELETE"
            });
            const json = await res.json();
            if (json.success) {
                setSuccessMessage("Service unlinked successfully");
                fetchData();
            } else {
                setErrorMessage(json.error);
            }
        } catch {
            setErrorMessage("Failed to unlink service");
        } finally {
            setIsActionLoading(false);
        }
    };

    // --- Helpers ---

    const filteredRooms = rooms.filter(r => 
        r.room_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getServicesForRoom = (roomId: number) => {
        return roomMassages.filter(rm => rm.room_id === roomId).map(rm => ({
            ...rm,
            massage_name: massages.find(m => m.massage_id === rm.massage_id)?.massage_name || "Unknown"
        }));
    };

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    // --- Render ---

    return (
        <main className="relative flex-1 w-full font-mitr">
            {/* Background elements to match other pages */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -right-32 -top-28 h-[420px] w-[420px] rounded-full bg-primary/6 blur-3xl" />
                <div className="absolute bottom-0 left-[-12rem] h-[360px] w-[360px] rounded-full bg-secondary/40 blur-3xl" />
            </div>

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
                {/* Consistent Header Section */}
                <header className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
                        <DoorOpen className="h-7 w-7 text-primary" />
                    </div>
                    <p className="mb-2 font-sans text-xs font-medium uppercase tracking-[0.32em] text-primary/60">ผู้จัดการ · Manager</p>
                    <h1 className="text-3xl font-bold text-foreground md:text-4xl">จัดการห้องนวด</h1>
                    <p className="mx-auto mt-3 max-w-2xl font-sans text-sm text-muted-foreground md:text-base">
                        บริหารจัดการห้องสำหรับให้บริการและกำหนดประเภทบริการที่สามารถทำได้ในแต่ละห้อง
                    </p>
                    
                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                        <Button variant="outline" onClick={fetchData} disabled={isLoading} className="h-11 rounded-full px-6">
                            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                            รีเฟรช
                        </Button>
                        <Button onClick={() => setIsAddRoomOpen(true)} className="h-11 rounded-full px-8 shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-4 w-4" />
                            เพิ่มห้องใหม่
                        </Button>
                    </div>
                </header>

                {/* Alerts */}
                {(errorMessage || successMessage) && (
                    <div className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300",
                        errorMessage ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                    )}>
                        {errorMessage ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        {errorMessage ?? successMessage}
                    </div>
                )}

                {/* Search & Stats */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="ค้นหาชื่อห้อง..." 
                            className="pl-9 h-11 bg-card/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground bg-card/40 px-6 py-2.5 rounded-full border border-border/40">
                        <div className="flex items-center gap-2">
                            <DoorOpen className="h-4 w-4 text-primary" />
                            <span>ทั้งหมด <b>{rooms.length}</b> ห้อง</span>
                        </div>
                        <div className="h-4 w-px bg-border/60" />
                        <div className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-primary" />
                            <span>การเชื่อมโยง <b>{roomMassages.length}</b> รายการ</span>
                        </div>
                    </div>
                </div>

                {/* Room Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden border-border/60">
                                <CardHeader className="space-y-2">
                                    <Skeleton className="h-6 w-1/3" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        ))
                    ) : filteredRooms.length > 0 ? (
                        filteredRooms.map((room) => {
                            const services = getServicesForRoom(room.room_id);
                            return (
                                <Card key={room.room_id} className="group relative overflow-hidden border-border/60 bg-card/40 backdrop-blur-sm transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                    <DoorOpen className="h-5 w-5 text-primary" />
                                                    {room.room_name}
                                                </CardTitle>
                                                <CardDescription className="text-xs">ID: {room.room_id}</CardDescription>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => {
                                                        setSelectedRoom(room);
                                                        setEditRoomName(room.room_name);
                                                        setIsEditRoomOpen(true);
                                                    }}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => {
                                                        setSelectedRoom(room);
                                                        setIsDeleteConfirmOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">บริการที่รองรับ</p>
                                            <div className="flex flex-wrap gap-1.5 min-h-[2.5rem]">
                                                {services.length > 0 ? (
                                                    services.map(s => (
                                                        <Badge key={s.room_massage_id} variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[10px] px-2 py-0">
                                                            {s.massage_name} (x{s.capacity})
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-muted-foreground italic">ยังไม่มีบริการที่เชื่อมโยง</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            className="w-full h-9 text-xs border-dashed"
                                            onClick={() => {
                                                setSelectedRoom(room);
                                                setIsManageServicesOpen(true);
                                            }}
                                        >
                                            <Settings2 className="mr-2 h-3.5 w-3.5" />
                                            จัดการการเชื่อมโยงบริการ
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                            <DoorOpen className="h-12 w-12 opacity-10" />
                            <p>ไม่พบข้อมูลห้องนวด</p>
                        </div>
                    )}
                </div>

                {/* Modals */}
                
                {/* Add Room */}
                <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
                    <DialogContent className="font-mitr">
                        <DialogHeader>
                            <DialogTitle>เพิ่มห้องใหม่</DialogTitle>
                            <DialogDescription>ระบุชื่อห้องนวดที่ต้องการเพิ่มลงในระบบ</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="room_name">ชื่อห้อง</Label>
                                <Input 
                                    id="room_name" 
                                    placeholder="เช่น ห้อง VIP 01" 
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>ยกเลิก</Button>
                            <Button onClick={handleAddRoom} disabled={isActionLoading || !newRoomName.trim()}>
                                {isActionLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                ยืนยันเพิ่มห้อง
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Room */}
                <Dialog open={isEditRoomOpen} onOpenChange={setIsEditRoomOpen}>
                    <DialogContent className="font-mitr">
                        <DialogHeader>
                            <DialogTitle>แก้ไขชื่อห้อง</DialogTitle>
                            <DialogDescription>เปลี่ยนชื่อห้อง ID: {selectedRoom?.room_id}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_room_name">ชื่อห้อง</Label>
                                <Input 
                                    id="edit_room_name" 
                                    value={editRoomName}
                                    onChange={(e) => setEditRoomName(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditRoomOpen(false)}>ยกเลิก</Button>
                            <Button onClick={handleUpdateRoom} disabled={isActionLoading || !editRoomName.trim()}>
                                {isActionLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                บันทึกการเปลี่ยนแปลง
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Manage Services (room_massage) */}
                <Dialog open={isManageServicesOpen} onOpenChange={setIsManageServicesOpen}>
                    <DialogContent className="max-w-2xl font-mitr">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-primary" />
                                จัดการบริการ: {selectedRoom?.room_name}
                            </DialogTitle>
                            <DialogDescription>กำหนดว่าห้องนี้สามารถให้บริการนวดประเภทใดได้บ้างและรองรับได้กี่ที่นั่ง</DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-4">
                            {/* Form to Add Link */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-xl bg-muted/30 border border-border/60">
                                <div className="md:col-span-6 space-y-2">
                                    <Label className="text-xs">เลือกบริการนวด</Label>
                                    <select 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={linkingMassageId}
                                        onChange={(e) => setLinkingMassageId(e.target.value ? Number(e.target.value) : "")}
                                    >
                                        <option value="">เลือกบริการ...</option>
                                        {massages.map(m => (
                                            <option key={m.massage_id} value={m.massage_id}>{m.massage_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <Label className="text-xs">ความจุ (คน)</Label>
                                    <Input 
                                        type="number" 
                                        min={1} 
                                        value={linkingCapacity}
                                        onChange={(e) => setLinkingCapacity(Number(e.target.value))}
                                    />
                                </div>
                                <div className="md:col-span-3 flex items-end">
                                    <Button 
                                        className="w-full" 
                                        disabled={isActionLoading || !linkingMassageId}
                                        onClick={handleAddServiceLink}
                                    >
                                        <Plus className="mr-1 h-4 w-4" /> เพิ่ม
                                    </Button>
                                </div>
                            </div>

                            {/* Current Links List */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    รายการที่เชื่อมโยงอยู่
                                </h4>
                                <div className="border rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                                            <tr>
                                                <th className="px-4 py-2 text-left">บริการ</th>
                                                <th className="px-4 py-2 text-center w-24">ความจุ</th>
                                                <th className="px-4 py-2 text-right w-20"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {selectedRoom && getServicesForRoom(selectedRoom.room_id).length > 0 ? (
                                                getServicesForRoom(selectedRoom.room_id).map(link => (
                                                    <tr key={link.room_massage_id} className="hover:bg-muted/10">
                                                        <td className="px-4 py-3 font-medium">{link.massage_name}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                                                                <Users className="h-3.5 w-3.5" />
                                                                {link.capacity}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleRemoveServiceLink(link.room_massage_id)}
                                                                disabled={isActionLoading}
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground italic">
                                                        ไม่มีข้อมูลการเชื่อมโยงบริการ
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setIsManageServicesOpen(false)}>ปิดหน้าต่าง</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                    <DialogContent className="font-mitr">
                        <DialogHeader>
                            <DialogTitle className="text-destructive flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                ยืนยันการลบห้อง
                            </DialogTitle>
                            <DialogDescription>
                                คุณแน่ใจหรือไม่ที่จะลบ <b>{selectedRoom?.room_name}</b>? 
                                <br />การดำเนินการนี้จะลบข้อมูลการเชื่อมโยงบริการทั้งหมดที่เกี่ยวข้องกับห้องนี้ด้วย
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>ยกเลิก</Button>
                            <Button variant="destructive" onClick={handleDeleteRoom} disabled={isActionLoading}>
                                {isActionLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                ยืนยันการลบ
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </main>
    );
}
