import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { LogIn, User, Lock } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    
    // Simular delay de autenticación
    setTimeout(async () => {
      const success = await login(formData.username, formData.password);
      
      if (success) {
        toast.success('¡Bienvenido! Sesión iniciada correctamente');
        setFormData({ username: '', password: '' });
      } else {
        toast.error('Usuario o contraseña incorrectos');
      }
      
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E293B] via-[#334155] to-[#475569] p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#B02128] rounded-2xl mb-4 shadow-lg">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-white text-3xl mb-2">Sistema de Gestión</h1>
          <p className="text-gray-300">Mototaxis y Refacciones</p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center text-[#1E293B]">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#1E293B]">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#1E293B]">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#B02128] hover:bg-[#8B1A20] text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Ingresando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </span>
                )}
              </Button>
            </form>

            {/* Demo credentials info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500 mb-3">Credenciales de prueba:</p>
              <div className="space-y-2 text-xs">
                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                  <p className="text-[#B02128]">👤 Administrador</p>
                  <p className="text-gray-600">Usuario: <span className="font-mono">admin</span> | Contraseña: <span className="font-mono">admin123</span></p>
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                  <p className="text-[#B02128]">👤 Vendedor</p>
                  <p className="text-gray-600">Usuario: <span className="font-mono">vendedor</span> | Contraseña: <span className="font-mono">vendedor123</span></p>
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                  <p className="text-[#B02128]">👤 Facturista</p>
                  <p className="text-gray-600">Usuario: <span className="font-mono">facturista</span> | Contraseña: <span className="font-mono">facturista123</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-300 text-xs mt-6">
          © 2024 Mototaxis y Refacciones S.A. de C.V.
        </p>
      </div>
    </div>
  );
}
