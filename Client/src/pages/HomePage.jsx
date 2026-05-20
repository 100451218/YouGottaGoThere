import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { useFetch } from '../hooks/useFetch'
import RestaurantRecomendation from '../components/Home/RestaurantRecomendation'
import ToolBar from '../components/Home/ToolBar'

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
        console.log(result)
        if (result.success) {
            if (result.data==="Friends have no review in top 5"){
                setUserRecomendations([])
            } else {
                setUserRecomendations(result.data)
                console.log("User recomendations ", result.data)
            }
            
            
        }
    }

    return <div className="home">

        <ToolBar 
            userRecomendations={userRecomendations}></ToolBar>

        { userRecomendations.map((friend_review, index) => {
                return (<RestaurantRecomendation key={index} friend_review={friend_review}/>)
            
            })}
        
    </div>
}

export default Home