"use client";

import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from "@/firebase";
import { useMemo, useState } from "react";
import type { MacroLog, UserProfile } from "@/lib/types";
import { addMacroLog } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { Loader2, PlusCircle, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { collection, query, where, orderBy, Timestamp, doc } from "firebase/firestore";
import { getFoodInfo } from "@/ai/flows/get-food-info-flow";
import { Separator } from "../ui/separator";

const macroLogSchema = z.object({
  mealName: z.string().min(1, { message: "Meal name is required" }),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fats: z.coerce.number().min(0),
});

export function MacrosClient() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFetchingFoodInfo, setIsFetchingFoodInfo] = useState(false);
  const [foodSearch, setFoodSearch] = useState("");
  const { toast } = useToast();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const macroLogsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, "users", user.uid, "macro_logs"),
      where("createdAt", ">=", Timestamp.fromDate(today)),
      where("createdAt", "<", Timestamp.fromDate(tomorrow)),
      orderBy("createdAt", "desc")
    );
  }, [user, firestore]);

  const { data: macroLogs, isLoading: loading } = useCollection<MacroLog>(macroLogsQuery);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<z.infer<typeof macroLogSchema>>({
    resolver: zodResolver(macroLogSchema),
    defaultValues: {
      mealName: "", calories: 0, protein: 0, carbs: 0, fats: 0,
    },
  });

  const handleFoodSearch = async () => {
    if (!foodSearch) return;
    setIsFetchingFoodInfo(true);
    try {
        const foodInfo = await getFoodInfo({ foodName: foodSearch });
        form.setValue("calories", foodInfo.calories);
        form.setValue("protein", foodInfo.protein);
        form.setValue("carbs", foodInfo.carbs);
        form.setValue("fats", foodInfo.fats);
        form.setValue("mealName", foodSearch.charAt(0).toUpperCase() + foodSearch.slice(1));
        toast({ title: "Success", description: "Food info populated." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch food information." });
    } finally {
        setIsFetchingFoodInfo(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof macroLogSchema>) => {
    if (!user) return;
    try {
      await addMacroLog(user.uid, values);
      toast({ title: "Success", description: "Meal added successfully." });
      form.reset();
      setFoodSearch("");
      setIsSheetOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add meal." });
    }
  };

  const dailyTotals = useMemo(() => {
    return (macroLogs || []).reduce((acc, log) => {
        acc.calories += log.calories;
        acc.protein += log.protein;
        acc.carbs += log.carbs;
        acc.fats += log.fats;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [macroLogs]);

  const macroGoals = userProfile?.macroGoals || { calories: 2000, protein: 150, carbs: 200, fats: 70 };
  
  const getProgress = (current: number, goal: number) => (goal > 0 ? (current / goal) * 100 : 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Today's Summary</CardTitle>
          <CardDescription>Your total macro intake for today.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {loading ? <Skeleton className="h-32 w-full"/> : 
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium"><span>Calories</span><span>{dailyTotals.calories.toFixed(0)} / {macroGoals.calories}</span></div>
                    <Progress value={getProgress(dailyTotals.calories, macroGoals.calories)} />
                </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium"><span>Protein</span><span>{dailyTotals.protein.toFixed(0)}g / {macroGoals.protein}g</span></div>
                    <Progress value={getProgress(dailyTotals.protein, macroGoals.protein)} />
                </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium"><span>Carbs</span><span>{dailyTotals.carbs.toFixed(0)}g / {macroGoals.carbs}g</span></div>
                    <Progress value={getProgress(dailyTotals.carbs, macroGoals.carbs)} />
                </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium"><span>Fats</span><span>{dailyTotals.fats.toFixed(0)}g / {macroGoals.fats}g</span></div>
                    <Progress value={getProgress(dailyTotals.fats, macroGoals.fats)} />
                </div>
            </div>}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Today's Meals</CardTitle>
            <CardDescription>A list of meals you've logged today.</CardDescription>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Meal
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Meal</SheetTitle>
                <SheetDescription>Search for a food or enter the details manually.</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="food-search">Quick Add with AI</Label>
                    <div className="flex items-center space-x-2">
                        <Input 
                            id="food-search"
                            placeholder="e.g., 1 cup of rice"
                            value={foodSearch}
                            onChange={(e) => setFoodSearch(e.target.value)}
                            disabled={isFetchingFoodInfo}
                        />
                        <Button onClick={handleFoodSearch} disabled={isFetchingFoodInfo || !foodSearch} size="icon" variant="outline">
                            {isFetchingFoodInfo ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background px-2 text-xs text-muted-foreground">OR</span>
                </div>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="mealName" render={({ field }) => (
                      <FormItem><FormLabel>Meal Name</FormLabel><FormControl><Input placeholder="e.g., Chicken Salad" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="calories" render={({ field }) => (
                        <FormItem><FormLabel>Calories</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="protein" render={({ field }) => (
                        <FormItem><FormLabel>Protein (g)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="carbs" render={({ field }) => (
                        <FormItem><FormLabel>Carbs (g)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="fats" render={({ field }) => (
                        <FormItem><FormLabel>Fats (g)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <SheetFooter>
                    <SheetClose asChild><Button type="button" variant="secondary">Cancel</Button></SheetClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Meal
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meal</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Protein</TableHead>
                <TableHead>Carbs</TableHead>
                <TableHead>Fats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : macroLogs && macroLogs.length > 0 ? (
                macroLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.mealName}</TableCell>
                    <TableCell>{log.calories}</TableCell>
                    <TableCell>{log.protein}g</TableCell>
                    <TableCell>{log.carbs}g</TableCell>
                    <TableCell>{log.fats}g</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No meals logged today.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
