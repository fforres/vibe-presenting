import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSkywardAgent } from "@/hooks/use-skyward-agent";
import {
  CreatePresentationInputSchema,
  OutgoingMessageSchema,
} from "@/agents/message-schemas";
import { toast } from "sonner";

interface CreatePresentationFormProps {
  className?: string;
  onSuccess?: (id: string) => void;
}

export const CreatePresentationForm = ({
  onSuccess,
}: CreatePresentationFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Connect to the presentations agent
  const agent = useSkywardAgent({
    agent: "presentations",
    onMessage(message) {
      const parsedMessage = OutgoingMessageSchema.parse(
        JSON.parse(message.data)
      );
      if (parsedMessage.type === "created-presentation") {
        toast.success("Presentation created successfully!");
        onSuccess?.(parsedMessage.id);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!name.trim()) {
        throw new Error("Name is required");
      }

      if (!description.trim()) {
        throw new Error("Description is required");
      }

      // Send the create-presentation message to the agent
      await agent?.send(
        JSON.stringify(
          CreatePresentationInputSchema.parse({
            type: "create-presentation",
            name: name.trim(),
            description: description.trim(),
          })
        )
      );
    } catch (err) {
      setError(
        `Error creating presentation: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {error && (
        <div className="p-4 mb-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-lg font-medium">
            Presentation Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a name for your presentation"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-lg font-medium">
            Presentation Description
          </label>
          <div className="border rounded-md overflow-hidden">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this presentation is about in detail. You can include topics you want to cover, key points, target audience, and any specific requirements. The more information you provide, the better your presentation structure will be."
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Pro tip: Add as much detail as possible. This text will be analyzed
            to generate your presentation structure.
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Presentation"}
          </Button>
        </div>
      </form>
    </div>
  );
};
