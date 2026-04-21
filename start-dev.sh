#!/bin/bash

# Variables para almacenar los PIDs
BACKEND_PID=""
FRONTEND_PID=""

# Función para limpiar y apagar los servidores
cleanup() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Apagando servidores..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Esperar a que ambos procesos se cierren
    wait 2>/dev/null
    
    echo "✓ Servidores apagados correctamente"
    exit 0
}

# Configurar trap para capturar CTRL+C y SIGTERM
trap cleanup SIGINT SIGTERM

# Obtener el directorio del script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Iniciando servidores de desarrollo..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Iniciar backend
echo "📦 Iniciando Backend..."
cd "$SCRIPT_DIR/backend"
npm start &
BACKEND_PID=$!
echo "✓ Backend iniciado (PID: $BACKEND_PID)"
echo ""

# Iniciar frontend
echo "⚛️  Iniciando Frontend..."
cd "$SCRIPT_DIR/Client"
npm run dev &
FRONTEND_PID=$!
echo "✓ Frontend iniciado (PID: $FRONTEND_PID)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Ambos servidores están corriendo"
echo "📱 Frontend: http://localhost:5173 (o el puerto configurado)"
echo "📡 Backend: http://localhost:8800 (o el puerto configurado)"
echo ""
echo "⚠️  Presiona CTRL+C para apagar ambos servidores"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Mantener el script activo esperando a ambos procesos
# Si alguno muere, el script también terminará
wait
