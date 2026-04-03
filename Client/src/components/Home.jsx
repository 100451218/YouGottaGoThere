import { useAuthGuard } from '../hooks/useAuthGuard'

function Home() 
{
    // Verificar que el usuario está autenticado
    useAuthGuard()


    

    return <div className="home">

        Home
    </div>
}

export default Home