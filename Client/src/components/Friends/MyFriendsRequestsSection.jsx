import { useState } from 'react'
import PropTypes from "prop-types";
import { useFetch } from "../../hooks/useFetch";


/**
 * AddFriendsSection
 * Componente para mostrar la sección de añadir amigos
 * 
 * 
*/
function MyFriendsRequestsSection() {

    const {fetchRequest, loading: fetchLoading, error: fetchError} = useFetch()
    const [username, setUsername] = useState('')

    const friends_requests = [
        {"id":1,"name": "Pepe", "username": "PepeCrack"},
        {"id":2,"name": "Juan", "username": "JuanTheCool"},
    ]
    

    return (
        
        <section className="add-restaurant-section">
            <ul>
                {friends_requests.map(mapped_friend=>(
                <li friend={mapped_friend} key={mapped_friend.id}>{mapped_friend.name}<button>Aceptar</button></li>
                ))}
            {/* Important to add the key or other prop so that react can differentiate each element */}
            </ul>
            
            

            
        </section>

        
    )
}


export default MyFriendsRequestsSection 