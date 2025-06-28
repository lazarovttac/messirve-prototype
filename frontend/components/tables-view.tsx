"use client"; // Asegúrate de que este componente se ejecute en el cliente

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTables } from "@/contexts/TablesContext";
import { useReservations } from "@/contexts/ReservationsContext";
import { Table } from "@/lib/types";
import { Trash2, Edit, Loader2 } from "lucide-react";

export function TablesView() {
  // Get tables and functions from context
  const { tables, loading, error, createTable, updateTable, deleteTable } =
    useTables();
  const { generateTestReservations } = useReservations();

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableName, setTableName] = useState("");
  const [tablePeople, setTablePeople] = useState(1);
  const [generatingData, setGeneratingData] = useState(false);

  // Reset form when modal closes or editing mode changes
  useEffect(() => {
    if (editingTable) {
      setTableName(editingTable.name);
      setTablePeople(editingTable.people);
    } else {
      setTableName("");
      setTablePeople(1);
    }
  }, [editingTable, isModalOpen]);

  // Open modal
  const handleShowModal = (table?: Table) => {
    if (table) {
      setEditingTable(table);
    } else {
      setEditingTable(null);
    }
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
    document.body.style.overflow = "auto";
  };

  // Handle form submission
  const handleSaveTable = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (editingTable) {
        // Update existing table
        await updateTable(editingTable.id, {
          name: tableName,
          people: Number(tablePeople),
        });
      } else {
        // Create new table
        await createTable({
          name: tableName,
          people: Number(tablePeople),
        });
      }

      handleCloseModal();
    } catch (err) {
      console.error("Error saving table:", err);
    }
  };

  // Handle table deletion
  const handleDeleteTable = async (tableId: string) => {
    if (window.confirm("¿Estás seguro que deseas eliminar esta mesa?")) {
      try {
        await deleteTable(tableId);
      } catch (err) {
        console.error("Error deleting table:", err);
      }
    }
  };

  // Generate test data
  const handleGenerateTestData = async () => {
    try {
      setGeneratingData(true);
      await generateTestReservations(10); // Generate 10 test reservations
    } catch (err) {
      console.error("Error generating test data:", err);
    } finally {
      setGeneratingData(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-4">Gestionar mesas</h2>
        <div className="flex items-center gap-3">
          {/* <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateTestData}
            disabled={generatingData}
            className="rounded-xl"
          >
            {generatingData ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              "Generar reservas de prueba"
            )}
          </Button> */}
          <Button
            size="sm"
            onClick={() => handleShowModal()}
            className="rounded-xl"
          >
            Nueva mesa
          </Button>
        </div>
      </div>

      {/* Lista de mesas */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-600">{error}</div>
      ) : tables.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay mesas disponibles. Crea una nueva mesa para comenzar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <div
              key={table.id}
              className="border rounded-xl p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg">{table.name}</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShowModal(table)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTable(table.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Capacidad:{" "}
                <span className="font-medium">{table.people} personas</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal y overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 transition-opacity animate-fade-in"
            onClick={handleCloseModal}
          ></div>
          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl shadow-2xl bg-white p-8 border border-gray-200 transition-all animate-fade-in">
            <form className="space-y-6" onSubmit={handleSaveTable}>
              <h3 className="text-2xl font-bold mb-4 text-center">
                {editingTable ? "Editar Mesa" : "Agregar Nueva Mesa"}
              </h3>
              <div className="mb-2">
                <label
                  htmlFor="table-name"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Nombre mesa
                </label>
                <input
                  type="text"
                  id="table-name"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Inserte el nombre de la mesa"
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="table-capacity"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Capacidad
                </label>
                <input
                  type="number"
                  id="table-capacity"
                  value={tablePeople}
                  onChange={(e) => setTablePeople(Number(e.target.value))}
                  placeholder="Inserte la capacidad máxima de la mesa"
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  min={1}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow"
                >
                  {editingTable ? "Guardar cambios" : "Agregar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
