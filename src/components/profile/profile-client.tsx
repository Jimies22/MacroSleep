"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { updateUserProfile, uploadProfilePicture } from "@/lib/actions";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ChangeEvent, useRef, useEffect } from "react";
import type { UserProfile } from "@/lib/types";
import { doc } from "firebase/firestore";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email(),
    age: z.coerce.number().optional(),
    weight: z.coerce.number().optional(),
    macroGoals: z.object({
        calories: z.coerce.number().min(0),
        protein: z.coerce.number().min(0),
        carbs: z.coerce.number().min(0),
        fats: z.coerce.number().min(0),
    }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileClient() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        // The document for a user's profile is stored at /users/{uid}
        return doc(firestore, "users", user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        // Default values will be populated by the useEffect hook below
    });
    
    useEffect(() => {
        if (userProfile) {
            form.reset({
                name: userProfile.name || user?.displayName || "",
                email: userProfile.email || user?.email || "",
                age: userProfile.age,
                weight: userProfile.weight,
                macroGoals: userProfile.macroGoals || { calories: 2000, protein: 150, carbs: 200, fats: 70 },
            });
        } else if (user) {
            form.reset({
                name: user.displayName || "",
                email: user.email || "",
                age: undefined,
                weight: undefined,
                macroGoals: { calories: 2000, protein: 150, carbs: 200, fats: 70 },
            });
        }
    }, [userProfile, user, form]);


    const onSubmit = async (data: ProfileFormData) => {
        if (!user) return;
        try {
            await updateUserProfile(user.uid, data);
            toast({ title: "Success", description: "Profile updated successfully." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update profile." });
        }
    };
    
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && user) {
            toast({ title: "Uploading...", description: "Your new avatar is being uploaded." });
            try {
                await uploadProfilePicture(user.uid, file);
                toast({ title: "Success", description: "Avatar updated successfully." });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to upload avatar." });
            }
        }
    };

    const avatarPlaceholder = PlaceHolderImages.find(p => p.id === 'user-avatar');
    const getInitials = (name: string | null | undefined) => {
      if (!name) return "U";
      return name.split(' ').map(n => n[0]).join('').substring(0,2);
    }

    if (isLoading) {
      return <div>Loading...</div>
    }

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Avatar</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32 cursor-pointer" onClick={handleAvatarClick}>
                            <AvatarImage src={userProfile?.photoURL || user?.photoURL || avatarPlaceholder?.imageUrl} alt={user?.displayName || "User"} />
                            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                        </Avatar>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <Button variant="outline" onClick={handleAvatarClick}>Change Avatar</Button>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Update your personal details here.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormDescription>You cannot change your email address.</FormDescription><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-2 gap-4">
                                  <FormField control={form.control} name="age" render={({ field }) => (
                                      <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                  )} />
                                  <FormField control={form.control} name="weight" render={({ field }) => (
                                      <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                  )} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Macro Goals</CardTitle>
                                <CardDescription>Set your daily nutritional targets.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="macroGoals.calories" render={({ field }) => (
                                    <FormItem><FormLabel>Calories</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="macroGoals.protein" render={({ field }) => (
                                    <FormItem><FormLabel>Protein (g)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="macroGoals.carbs" render={({ field }) => (
                                    <FormItem><FormLabel>Carbs (g)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="macroGoals.fats" render={({ field }) => (
                                    <FormItem><FormLabel>Fats (g)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormMessage>
                                )} />
                            </CardContent>
                        </Card>

                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Profile
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
