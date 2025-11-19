import { api } from "../../lib/api";
import { Cliente } from "../clientes/ClientesPage";

export async function getClientes(): Promise<Cliente[]> {
  const res = await fetch(api("/clientes"), {
    method: "GET",
    headers: { "Accept": "application/json" },
    credentials: "include"
  });

  if (!res.ok) throw new Error("Error al obtener clientes");

  const data = await res.json();

  return data.data ?? data;
}
