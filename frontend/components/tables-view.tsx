"use client"; // Asegúrate de que este componente se ejecute en el cliente

import React, { useRef, useEffect } from "react"; // Importa useRef y useEffect

export function TablesView() {
  
  // 1. Crear referencias para el botón y el diálogo
  const modalRef = useRef<HTMLDialogElement>(null);
  const showModalButtonRef = useRef<HTMLButtonElement>(null);

  // 2. Función para abrir el modal
  const handleShowModal = () => {
    if (modalRef.current) {
      modalRef.current.showModal(); // Muestra el modal
    }
  };

  // Puedes agregar una función para cerrar el modal si lo necesitas dentro del formulario
  const handleCloseModal = () => {
    if (modalRef.current) {
      modalRef.current.close();
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestor de Mesas</h2>

      {/* Asigna la referencia al elemento dialog */}
      <dialog id="modal-agregar-mesa" ref={modalRef} className="p-4 border rounded shadow-lg bg-white">
        <form id="form-mesas" method="dialog"> {/* method="dialog" es importante para que el botón de submit cierre el dialog */}
          <h3 className="text-xl font-semibold mb-3">Agregar Nueva Mesa</h3>
          <div className="mb-2">
            <label htmlFor="id-mesa" className="block text-sm font-medium text-gray-700">Nombre mesa</label>
            <input type="text" id="id-mesa" name="id-mesa" placeholder="Inserte el nombre de la mesa" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></input>
          </div>
          <div className="mb-4">
            <label htmlFor="capacidad-mesa" className="block text-sm font-medium text-gray-700">Capacidad</label>
            <input type="number" id="capacidad-mesa" name="capacidad-mesa" placeholder="Inserte la capacidad máxima de la mesa" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></input>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" id="btn-agregar" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Agregar</button>
          </div>
        </form>
      </dialog>

      {/* Asigna la referencia y el evento onClick al botón */}
      <button id="mostrar-modal" ref={showModalButtonRef} onClick={handleShowModal} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
        Agregar nueva mesa
      </button>

      <ul id="lista-mesas">
        {/* Aquí iría la lista de mesas, que seguramente manejarás con un estado */}
      </ul>
    </div>
  );
}