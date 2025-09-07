import { Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "cards" | "table";

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border rounded-lg p-1">
      <Button
        variant={view === "cards" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("cards")}
        className="h-8 px-3"
      >
        <Grid className="h-4 w-4" />
        <span className="sr-only">Vue en cartes</span>
      </Button>
      <Button
        variant={view === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("table")}
        className="h-8 px-3"
      >
        <List className="h-4 w-4" />
        <span className="sr-only">Vue en tableau</span>
      </Button>
    </div>
  );
}
