import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'Administrador' | 'Vendedor' | 'Facturista';

interface User {
  username: string;
  role: UserRole;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios de prueba
const mockUsers = [
  { username: 'admin', password: 'admin123', role: 'Administrador' as UserRole, fullName: 'Administrador Sistema' },
  { username: 'vendedor', password: 'vendedor123', role: 'Vendedor' as UserRole, fullName: 'Juan Pérez' },
  { username: 'facturista', password: 'facturista123', role: 'Facturista' as UserRole, fullName: 'María López' },
];

// Definición de permisos por rol
const rolePermissions: Record<UserRole, string[]> = {
  Administrador: [
    'clientes.view', 'clientes.create', 'clientes.edit', 'clientes.delete',
    'refacciones.view', 'refacciones.create', 'refacciones.edit', 'refacciones.delete',
    'mototaxis.view', 'mototaxis.create', 'mototaxis.edit', 'mototaxis.delete',
    'servicios.view', 'servicios.create', 'servicios.edit', 'servicios.delete',
    'facturacion.view', 'facturacion.create', 'facturacion.cancel',
    'reportes.view', 'reportes.export',
    'configuracion.view', 'configuracion.edit',
  ],
  Vendedor: [
    'clientes.view', 'clientes.create', 'clientes.edit',
    'refacciones.view', 'refacciones.create', 'refacciones.edit',
    'mototaxis.view',
    'servicios.view', 'servicios.create', 'servicios.edit',
    'reportes.view',
  ],
  Facturista: [
    'clientes.view',
    'facturacion.view', 'facturacion.create', 'facturacion.cancel',
    'reportes.view', 'reportes.export',
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const foundUser = mockUsers.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      setUser({
        username: foundUser.username,
        role: foundUser.role,
        fullName: foundUser.fullName,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role].includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
