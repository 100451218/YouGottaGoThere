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
        {userRecomendations.map((friend_review) => {
            return (<div key={friend_review.user_id +friend_review.restaurant_id}>{friend_review.restaurant_id+" Es el top "+ friend_review.ranking + " de tu amigo "+ friend_review.user_id+ " su review es "+ friend_review.description + " "}</div>)
        })}
        
    </div>
}

export default Home