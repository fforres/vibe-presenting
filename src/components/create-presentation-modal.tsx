import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreatePresentationForm } from "@/components/create-presentation-form";

interface CreatePresentationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (id: string) => void;
}

export function CreatePresentationModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePresentationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Presentation</DialogTitle>
        </DialogHeader>
        <CreatePresentationForm
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
