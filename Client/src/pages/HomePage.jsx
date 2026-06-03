import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { useFetch } from '../hooks/useFetch'
import { useTags } from "../hooks/useTags"
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
    
    const { allTags} = useTags(fetchRequest)

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
        // We set filters to a brand new object with all the previous filters with the searchquery modified, to trigger the update of state
        setFilters(prevFilters => ({...prevFilters, searchQuery: e.target.value}))
    }

    const toggleTagFilter = (clickedTag) => {
        console.log("tag", clickedTag,"clicked")
        setFilters(prevFilters => {
            let newTags = [...prevFilters.activeTags]
            // if the clicked tag has been unchecked but it is still in the filters, remove it
            if (!clickedTag.checked && prevFilters.activeTags.includes(clickedTag.value)){
                console.log("tag was removed from filters")
                newTags = prevFilters.activeTags.filter(tag => tag !== clickedTag.value)
            // If the clicked tag has been checked but it is not in the filters, add it
            } else if (clickedTag.checked && !prevFilters.activeTags.includes(clickedTag.value)){
                console.log("tag was added to filters", clickedTag.value)
                newTags = [...prevFilters.activeTags, clickedTag.value];
                console.log("in",newTags)
            } else {
                console.log("info", clickedTag, prevFilters.activeTags)
            }
            console.log("out",newTags)
            return {...prevFilters, activeTags: newTags}
        })
        console.log("filters",filters)
    }


    const filteredRecomendations = userRecomendations.filter(rec => {
        const matchesSearch = rec.restaurant_name.toLowerCase().includes(filters.searchQuery.toLowerCase());

        const hasTags = filters.activeTags.length === 0 || filters.activeTags.every(tag => rec.tags && rec.tags.includes(tag));

        return matchesSearch && hasTags;
    })

    console.log("filteredRec",filteredRecomendations)

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
    
    { allTags && allTags.length>0 ? allTags.map((allTags, index) => {
        return (<input type='checkbox' key={index} value={allTags.id} onClick={(e) => toggleTagFilter(e.target)}></input>)
    }) : null}
    




        { filteredRecomendations && filteredRecomendations.length >0 ? filteredRecomendations.map((friend_review, index) => {
                return (<RestaurantRecomendation key={index} friend_review={friend_review} allTags={allTags}/>)
            }): null}
        
    </div>
}

export default Home