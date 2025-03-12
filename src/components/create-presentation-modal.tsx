import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreatePresentationForm } from "@/components/create-presentation-form";
import type { PresentationAgentState } from "@/agents/presentations-agent";
import type { useSkywardAgent } from "@/hooks/use-skyward-agent";

interface CreatePresentationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (id: string) => void;
  agent: ReturnType<typeof useSkywardAgent<PresentationAgentState>>;
}

export function CreatePresentationModal({
  open,
  onOpenChange,
  agent,
  onSuccess,
}: CreatePresentationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Presentation</DialogTitle>
        </DialogHeader>
        <CreatePresentationForm
          agent={agent}
          onSuccess={(id) => {
            // Close the modal when a presentation is successfully created
            onOpenChange(false);
            onSuccess?.(id);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
