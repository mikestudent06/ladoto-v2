import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, CalendarDays, Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { taskSchema, type TaskFormData } from "@/lib/validations";
import { useProjects } from "@/hooks/use-projects";
import type { Task } from "@/types";

interface TaskFormProps {
  task?: Task;
  projectId?: string;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

// Utilitaires de date
const getToday = () => new Date();
const getTomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
};
const getNextWeek = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
};
const getNextMonday = () => {
  const date = new Date();
  const day = date.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  date.setDate(date.getDate() + daysUntilMonday);
  return date;
};

// Options rapides de date
const quickDateOptions = [
  {
    label: "Aujourd'hui",
    value: "today",
    date: getToday(),
    icon: CalendarDays,
    className: "text-blue-600",
  },
  {
    label: "Demain",
    value: "tomorrow",
    date: getTomorrow(),
    icon: CalendarDays,
    className: "text-orange-600",
  },
  {
    label: "Lundi prochain",
    value: "next-monday",
    date: getNextMonday(),
    icon: CalendarDays,
    className: "text-purple-600",
  },
  {
    label: "Dans une semaine",
    value: "next-week",
    date: getNextWeek(),
    icon: CalendarDays,
    className: "text-green-600",
  },
];

interface DatePickerProps {
  value?: string;
  onChange: (date: string | undefined) => void;
  placeholder?: string;
}

function DatePicker({
  value,
  onChange,
  placeholder = "Choisir une date",
}: DatePickerProps) {
  const selectedDate = value ? new Date(value) : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    } else {
      onChange(undefined);
    }
  };

  const handleQuickSelect = (date: Date) => {
    onChange(format(date, "yyyy-MM-dd"));
  };

  return (
    <div className="space-y-3">
      {/* Options de date rapides - Grid responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {quickDateOptions.map((option) => {
          const Icon = option.icon;
          const isSelected =
            selectedDate &&
            format(selectedDate, "yyyy-MM-dd") ===
              format(option.date, "yyyy-MM-dd");

          return (
            <Button
              key={option.value}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickSelect(option.date)}
              className={cn(
                "justify-start text-left h-auto py-2 px-3",
                isSelected && "ring-2 ring-ring ring-offset-2",
                !isSelected && option.className
              )}
            >
              <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
              <div className="flex flex-col items-start min-w-0">
                <span className="font-medium text-sm truncate w-full">
                  {option.label}
                </span>
                <span className="text-xs opacity-70">
                  {format(option.date, "EEE d MMM", { locale: fr })}
                </span>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Séparateur */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground px-2">ou</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Sélecteur de date personnalisé */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {selectedDate
                ? format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
                : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) =>
              date < new Date(new Date().setHours(0, 0, 0, 0))
            }
            initialFocus
            locale={fr}
          />
          {selectedDate && (
            <div className="p-3 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange(undefined)}
                className="w-full"
              >
                Effacer la date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function TaskForm({
  task,
  projectId,
  onSubmit,
  onCancel,
  isLoading,
}: TaskFormProps) {
  const { data: projects } = useProjects();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema as any),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "todo",
      priority: task?.priority || "medium",
      project_id: task?.project_id || projectId || "",
      assignee_id: task?.assignee_id || undefined,
      // Défaut à aujourd'hui si pas de tâche existante
      due_date: task?.due_date || format(new Date(), "yyyy-MM-dd"),
    },
  });

  const isEditing = !!task;

  const handleFormSubmit = async (data: TaskFormData) => {
    const cleanedData: TaskFormData = {
      ...data,
      assignee_id:
        data.assignee_id && data.assignee_id.trim() !== ""
          ? data.assignee_id
          : undefined,
      due_date:
        data.due_date && data.due_date.trim() !== ""
          ? data.due_date
          : undefined,
      description:
        data.description && data.description.trim() !== ""
          ? data.description
          : undefined,
    };

    await onSubmit(cleanedData);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit as any)}
      className="space-y-4 sm:space-y-6"
    >
      {/* Titre */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Titre de la tâche
        </Label>
        <Input
          id="title"
          placeholder="Entrez le titre de la tâche..."
          {...register("title")}
          className={cn("w-full", errors.title && "border-destructive")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description (Optionnel)
        </Label>
        <Textarea
          id="description"
          placeholder="Décrivez la tâche..."
          rows={3}
          {...register("description")}
          className={cn(
            "w-full resize-none",
            errors.description && "border-destructive"
          )}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Statut, Priorité, Projet - Grid responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Statut</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">À faire</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="done">Terminé</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Priorité</Label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner la priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label className="text-sm font-medium">Projet</Label>
          <Controller
            name="project_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!!projectId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner le projet" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.project_id && (
            <p className="text-sm text-destructive">
              {errors.project_id.message}
            </p>
          )}
        </div>
      </div>

      {/* Date d'échéance */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Date d'échéance</Label>
        <Controller
          name="due_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              placeholder="Choisir une date d'échéance"
            />
          )}
        />
        {errors.due_date && (
          <p className="text-sm text-destructive">{errors.due_date.message}</p>
        )}
      </div>

      {/* Actions - Stack sur mobile, inline sur desktop */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full sm:w-auto"
        >
          {(isSubmitting || isLoading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isEditing ? "Modifier la tâche" : "Créer la tâche"}
        </Button>
      </div>
    </form>
  );
}
