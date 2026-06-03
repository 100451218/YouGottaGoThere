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
    
    // Estado: Filtros
    const [filters, setFilters] = useState({
        searchQuery: "",
        activeTags: []
    })


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
            }   
        }
    }

    const handleSearchChange = (e) => {
        console.log("Saving searchbarQuery")
        /*
        const filtered = userRecomendations && userRecomendations.filter((item) => {
            // In here, we apply the rules of the filter since we only have the name filter, we only set it based on the name
            return item.restaurant_name.toLowerCase().includes(e.toLowerCase())
        })
        setFilteredRecomendations(filtered)*/
        setFilters(prevFilters => ({...prevFilters, searchQuery: e.target.value}))
    }

    const toggleTagFilter = (clickedTag) => {
        console.log("tag", clickedTag,"clicked")
    }


    const filteredRecomendations = userRecomendations.filter(rec => {
        const matchesSearch = rec.restaurant_name.toLowerCase().includes(filters.searchQuery.toLowerCase());

        const hasTags = filters.activeTags.length === 0 || filters.activeTags.every(tag => rec.tags.includes(tag));

        return matchesSearch && hasTags;
    })

    console.log(filteredRecomendations)

    return <div className="home">

        {/*<ToolBar 
            searchBarInput={searchBarInput}></ToolBar>*/}
    <input  
        type='search'
        className='searchbar'
        placeholder='Search'
        value={filters.searchQuery}
        onChange={(e) => {
            handleSearchChange(e)
        }}
    ></input>
        { filteredRecomendations && filteredRecomendations.length >0 ? filteredRecomendations.map((friend_review, index) => {
                return (<RestaurantRecomendation key={index} friend_review={friend_review}/>)
            }): null}
        
    </div>
}

export default Home