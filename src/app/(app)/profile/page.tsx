import { Metadata } from "next";
import { ProfileClient } from "@/components/profile/profile-client";

export const metadata: Metadata = {
    title: "Profile | MacroSleep",
    description: "Manage your profile and settings.",
};

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>
            <ProfileClient />
        </div>
    );
}
