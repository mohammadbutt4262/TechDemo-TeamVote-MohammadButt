'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addIdea } from '@/actions/ideas';
import { Lightbulb } from 'lucide-react';

interface AddIdeaFormProps {
  currentUsername: string | null;
  onIdeaAdded: () => void;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(500),
});

export function AddIdeaForm({ currentUsername, onIdeaAdded }: AddIdeaFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUsername) {
      toast({
        title: "Error",
        description: "You must set a username before adding an idea.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await addIdea(values); 
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        form.reset();
        onIdeaAdded();
      } else {
         throw new Error(result.message || "Failed to add idea");
      }
    } catch (error) {
      toast({
        title: "Error adding idea",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!currentUsername) {
    return (
      <Card className="mb-8 bg-muted/50 shadow">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2"><Lightbulb className="text-primary" /> Add Your Idea</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please log in by setting a username to add an idea.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Lightbulb className="text-primary" /> Add New Idea (Anonymously)</CardTitle>
        <CardDescription>Share your brilliant ideas with the team! Your submission will be anonymous.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idea Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Implement Dark Mode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idea Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your idea in detail..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting || !currentUsername} className="w-full sm:w-auto">
              {isSubmitting ? "Submitting..." : "Add Idea Anonymously"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
