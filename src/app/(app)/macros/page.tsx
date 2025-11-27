import { Metadata } from "next";
import { MacrosClient } from "@/components/macros/macros-client";

export const metadata: Metadata = {
    title: "Macro Tracker | MacroSleep",
    description: "Log and analyze your food macros.",
};

export default function MacrosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Macro Tracker</h1>
                <p className="text-muted-foreground">Log your meals to stay on top of your diet.</p>
            </div>
            <MacrosClient />
        </div>
    );
}
