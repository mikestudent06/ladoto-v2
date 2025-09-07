import React, { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  ArrowUpDown,
  Download,
  Search,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Types
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
  width?: string;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onBulkDelete?: (items: T[]) => void;
  onExport?: () => void;
  searchPlaceholder?: string;
  className?: string;
  emptyMessage?: string;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  onExport,
  searchPlaceholder = "Rechercher...",
  className,
  emptyMessage = "Aucune donnée trouvée",
  pageSize = 10,
}: DataTableProps<T>) {
  // État
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Obtenir les valeurs uniques pour les colonnes filtrables
  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    columns.forEach((column) => {
      if (column.filterable && typeof column.key === "string") {
        const values = [
          ...new Set(data.map((item) => item[column.key]).filter(Boolean)),
        ];
        options[column.key] = values.map(String);
      }
    });
    return options;
  }, [data, columns]);

  // Filtrer et trier les données
  const filteredAndSortedData = useMemo(() => {
    let filteredData = data;

    // Appliquer le filtre de recherche
    if (searchTerm) {
      filteredData = filteredData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Appliquer les filtres de colonnes
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filteredData = filteredData.filter(
          (item) => String(item[key]) === value
        );
      }
    });

    // Appliquer le tri
    if (sortConfig) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [data, searchTerm, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  // Gestionnaires
  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(paginatedData.map((item) => item.id));
      setSelectedItems(newSelected);
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkDelete = () => {
    if (onBulkDelete) {
      const itemsToDelete = data.filter((item) => selectedItems.has(item.id));
      onBulkDelete(itemsToDelete);
      setSelectedItems(new Set());
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedItems.has(item.id));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {/* Recherche */}
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Filtres de colonnes */}
          {Object.entries(filterOptions).map(([key, options]) => {
            const column = columns.find((col) => col.key === key);
            if (!column?.filterable) return null;

            return (
              <Select
                key={key}
                value={filters[key] || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    [key]: value === "all" ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={`Filtrer ${column.label}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout {column.label}</SelectItem>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          {/* Actions en lot */}
          {selectedItems.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedItems.size} sélectionné
                {selectedItems.size > 1 ? "s" : ""}
              </span>
              {onBulkDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer ({selectedItems.size})
                </Button>
              )}
            </div>
          )}

          {/* Exporter */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {/* Case à cocher Tout sélectionner */}
                {onBulkDelete && (
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Tout sélectionner"
                    />
                  </th>
                )}

                {/* En-têtes de colonnes */}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium",
                      column.className
                    )}
                    style={{ width: column.width }}
                  >
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                        onClick={() => handleSort(String(column.key))}
                      >
                        <span>{column.label}</span>
                        {getSortIcon(String(column.key))}
                      </Button>
                    ) : (
                      <span>{column.label}</span>
                    )}
                  </th>
                ))}

                {/* Colonne Actions */}
                {(onEdit || onDelete || onView) && (
                  <th className="w-20 px-4 py-3">
                    <span className="text-sm font-medium">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (onBulkDelete ? 1 : 0) +
                      (onEdit || onDelete || onView ? 1 : 0)
                    }
                    className="px-4 py-8 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (onBulkDelete ? 1 : 0) +
                      (onEdit || onDelete || onView ? 1 : 0)
                    }
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    {/* Case à cocher de sélection */}
                    {onBulkDelete && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) =>
                            handleSelectItem(item.id, checked as boolean)
                          }
                          aria-label={`Sélectionner la ligne ${index + 1}`}
                        />
                      </td>
                    )}

                    {/* Colonnes de données */}
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn("px-4 py-3", column.className)}
                      >
                        {column.render
                          ? column.render(
                              item[column.key as keyof T],
                              item,
                              index
                            )
                          : String(item[column.key as keyof T] || "")}
                      </td>
                    ))}

                    {/* Actions */}
                    {(onEdit || onDelete || onView) && (
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Ouvrir le menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onView && (
                              <DropdownMenuItem onClick={() => onView(item)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir
                              </DropdownMenuItem>
                            )}
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => onDelete(item)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Affichage de{" "}
              {Math.min(
                (currentPage - 1) * pageSize + 1,
                filteredAndSortedData.length
              )}{" "}
              à {Math.min(currentPage * pageSize, filteredAndSortedData.length)}{" "}
              sur {filteredAndSortedData.length} résultats
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
