// src/components/Configuracion/configuracionService.ts
import { api } from "../../lib/api";

export const ConfiguracionService = {
  // ───────────────────────────────────────────
  // USUARIOS
  // ───────────────────────────────────────────
  getUsuarios: async () => {
    const res = await fetch(api("/configuracion/usuarios"), {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al cargar usuarios");
    return res.json();
  },

  crearUsuario: async (data: any) => {
    const res = await fetch(api("/configuracion/usuarios"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear usuario");
    return res.json();
  },

  actualizarUsuario: async (id: number, data: any) => {
    const res = await fetch(api(`/configuracion/usuarios/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar usuario");
    return res.json();
  },

  toggleUsuario: async (id: number) => {
    const res = await fetch(api(`/configuracion/usuarios/${id}/toggle`), {
      method: "PATCH",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al cambiar estado del usuario");
    return res.json();
  },

  // ───────────────────────────────────────────
  // CONFIGURACIÓN GENERAL
  // ───────────────────────────────────────────
  getConfig: async () => {
    const res = await fetch(api("/configuracion"), { credentials: "include" });
    if (!res.ok) throw new Error("Error al cargar configuración");
    return res.json();
  },

  saveConfig: async (data: any) => {
    const res = await fetch(api("/configuracion"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al guardar configuración");
    return res.json();
  },

  // ───────────────────────────────────────────
  // CAMBIO DE CONTRASEÑA
  // ───────────────────────────────────────────
  cambiarPassword: async (data: any) => {
    const res = await fetch(api("/configuracion/cambiar-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al cambiar contraseña");
    return res.json();
  },
};
