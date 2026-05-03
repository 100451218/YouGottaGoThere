import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { useFetch } from '../hooks/useFetch'

function Home() 
{
    // Verificar que el usuario está autenticado
    const {currentUser} = useAuth()
    useAuthGuard()

    const { fetchRequest, loading: fetchLoading, error: fetchError } = useFetch()
    
    // Estado: Restaurantes recomendados para el usuario
    const [userRecomendations, setUserRecomendations] = useState([])

    // Cargar las recomendaciones al usuario al montar
    useEffect(() => {
        if (currentUser) {
            loadUserRecomendations()
        }
    }, [currentUser])


    const loadUserRecomendations = async () => {
        console.log("Al abrir la página, cargar los restaurantes")
        const result = await fetchRequest("/recomendations")
        if (result.success) {
            setUserRecomendations(result.data)
            console.log(result.data)
        }
    }

    return <div className="home">

        Homeaaa
    </div>
}

export default Home