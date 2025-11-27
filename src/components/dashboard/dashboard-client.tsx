"use client";

import { useUser } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bed, UtensilsCrossed, Zap } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getTodaysMacroLogs, getSleepLogs } from "@/lib/actions";
import type { MacroLog, SleepLog, UserProfile } from "@/lib/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import { Skeleton } from "../ui/skeleton";
import { differenceInDays, format, startOfWeek } from "date-fns";

const MACRO_COLORS = {
  protein: "hsl(var(--chart-1))",
  carbs: "hsl(var(--chart-2))",
  fats: "hsl(var(--chart-3))",
};

export function DashboardClient() {
  const { user } = useUser();
  const [macroLogs, setMacroLogs] = useState<MacroLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // A new state to hold the user profile data, including macro goals.
  // We can't rely on the user object from useUser for custom fields like macroGoals
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        // We will fetch user profile data separately to get custom fields
        // This part needs a function to fetch profile, let's assume it's in actions
        // const profile = await getUserProfile(user.uid); 
        // setUserProfile(profile);

        const [macros, sleep] = await Promise.all([
          getTodaysMacroLogs(user.uid),
          getSleepLogs(user.uid),
        ]);
        setMacroLogs(macros);
        setSleepLogs(sleep);
        setLoading(false);
      };
      fetchData();
    }
  }, [user]);

  const dailyTotals = useMemo(() => {
    return macroLogs.reduce(
      (acc, log) => {
        acc.calories += log.calories;
        acc.protein += log.protein;
        acc.carbs += log.carbs;
        acc.fats += log.fats;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [macroLogs]);
  
  const lastNightSleep = useMemo(() => {
    if (sleepLogs.length === 0) return null;
    const sortedLogs = [...sleepLogs].sort((a, b) => b.startTime.toMillis() - a.startTime.toMillis());
    const mostRecentLog = sortedLogs[0];
    
    const logDate = mostRecentLog.startTime.toDate();
    const today = new Date();
    
    if (differenceInDays(today, logDate) <= 1) {
        return mostRecentLog;
    }
    return null;
  }, [sleepLogs]);

  const weeklySleepData = useMemo(() => {
    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfThisWeek);
      day.setDate(day.getDate() + i);
      return {
        date: format(day, "eee"),
        totalHours: 0,
      };
    });

    sleepLogs.forEach(log => {
      const logDate = log.date.toDate();
      if (logDate >= startOfThisWeek) {
        const dayIndex = (logDate.getDay() + 6) % 7; // Monday is 0
        if (weekData[dayIndex]) {
          weekData[dayIndex].totalHours += log.totalHours;
        }
      }
    });

    return weekData;
  }, [sleepLogs]);

  const macroPieData = [
    { name: "Protein", value: dailyTotals.protein, fill: MACRO_COLORS.protein },
    { name: "Carbs", value: dailyTotals.carbs, fill: MACRO_COLORS.carbs },
    { name: "Fats", value: dailyTotals.fats, fill: MACRO_COLORS.fats },
  ].filter(d => d.value > 0);

  // We need to get macroGoals from the user profile state
  const macroGoals = userProfile?.macroGoals || { calories: 2000, protein: 150, carbs: 200, fats: 70 };

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        Welcome back, {user?.displayName || "User"}!
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <Skeleton className="h-[126px]" />
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Sleep</CardTitle>
              <Bed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lastNightSleep?.totalHours.toFixed(1) || 'N/A'} hrs</div>
              <p className="text-xs text-muted-foreground">
                {lastNightSleep ? `From ${format(lastNightSleep.startTime.toDate(), 'p')} to ${format(lastNightSleep.endTime.toDate(), 'p')}` : 'No recent sleep logged'}
              </p>
            </CardContent>
          </Card>
        )}
        {loading ? (
          <Skeleton className="h-[126px]" />
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calories Today</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dailyTotals.calories.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">/ {macroGoals.calories} kcal goal</p>
            </CardContent>
          </Card>
        )}
        {loading ? (
          <Skeleton className="h-[126px]" />
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Macros Today</CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                P: {dailyTotals.protein.toFixed(0)}g C: {dailyTotals.carbs.toFixed(0)}g F: {dailyTotals.fats.toFixed(0)}g
              </div>
              <p className="text-xs text-muted-foreground">
                Goals: {macroGoals.protein}g / {macroGoals.carbs}g / {macroGoals.fats}g
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Sleep</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             {loading ? <Skeleton className="h-[350px] w-full" /> : 
             <ChartContainer config={{}} className="h-[350px] w-full">
              <RechartsBarChart data={weeklySleepData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis unit="h" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="totalHours" fill="hsl(var(--primary))" radius={4} />
              </RechartsBarChart>
            </ChartContainer>}
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Today's Macro Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[350px] w-full" /> : 
            <ChartContainer config={{}} className="mx-auto aspect-square h-[350px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={macroPieData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                  {macroPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
