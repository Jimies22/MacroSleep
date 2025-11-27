import { Metadata } from "next";
import { SleepClient } from "@/components/sleep/sleep-client";

export const metadata: Metadata = {
    title: "Sleep Tracker | MacroSleep",
    description: "Log and analyze your sleep patterns.",
};

export default function SleepPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Sleep Tracker</h1>
                <p className="text-muted-foreground">Monitor your sleep to improve your health.</p>
            </div>
            <SleepClient />
        </div>
    );
}
