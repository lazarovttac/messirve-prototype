import React from "react";

// Esto es una "función" que se convierte en tu "pieza" (componente)
export function TablesView() {
  return (
    // Esto es lo que va a mostrar esta "pieza" en la pantalla
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestor de Mesas</h2>

      <dialog id="modal-agregar-mesa">
        <form id="form-mesas">
            <label htmlFor="id-mesa">Nombre mesa</label>
            <input type="text" id="id-mesa" name="id-mesa" placeholder="Inserte el nombre de la mesa"></input>
            <label htmlFor="capacidad-mesa">Capacidad</label>
            <input type="number" id="capacidad-mesa" name="capacidad-mesa" placeholder="Inserte la capacidad máxima de la mesa"></input>
            <button id="btn-agregar">Agregar</button>
        </form>
      </dialog>

      <button id="mostrar-modal">Agregar nueva mesa</button>
      <ul id="lista-mesas">

      </ul>

    </div>
  );
}