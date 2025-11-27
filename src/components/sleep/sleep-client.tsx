"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useEffect, useState } from "react";
import type { SleepLog } from "@/lib/types";
import { addSleepLog, getSleepLogs } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistance } from "date-fns";
import { Skeleton } from "../ui/skeleton";
import { Loader2, PlusCircle } from "lucide-react";

const sleepLogSchema = z.object({
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
}).refine(data => new Date(data.endTime) > new Date(data.startTime), {
  message: "End time must be after start time",
  path: ["endTime"],
});

export function SleepClient() {
  const { user } = useAuth();
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof sleepLogSchema>>({
    resolver: zodResolver(sleepLogSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
    },
  });

  const fetchLogs = async () => {
    if (user) {
      setLoading(true);
      const logs = await getSleepLogs(user.uid);
      setSleepLogs(logs);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const onSubmit = async (values: z.infer<typeof sleepLogSchema>) => {
    if (!user) return;
    try {
      await addSleepLog(user.uid, { startTime: new Date(values.startTime), endTime: new Date(values.endTime) });
      toast({ title: "Success", description: "Sleep log added successfully." });
      form.reset();
      setIsDialogOpen(false);
      await fetchLogs();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add sleep log." });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sleep History</CardTitle>
          <CardDescription>A record of your past sleep sessions.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Log
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Sleep Log</DialogTitle>
              <DialogDescription>Enter the start and end time of your sleep.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Log
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Time Range</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                </TableRow>
              ))
            ) : sleepLogs.length > 0 ? (
              sleepLogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{format(log.date.toDate(), "MMM d, yyyy")}</TableCell>
                  <TableCell>{log.totalHours.toFixed(1)} hrs</TableCell>
                  <TableCell>{`${format(log.startTime.toDate(), "p")} - ${format(log.endTime.toDate(), "p")}`}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No sleep logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
