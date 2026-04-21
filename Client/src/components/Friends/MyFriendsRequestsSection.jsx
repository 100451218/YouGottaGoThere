import { useState } from 'react'
import PropTypes from "prop-types";
import { useFetch } from "../../hooks/useFetch";


/**
 * AddFriendsSection
 * Componente para mostrar la sección de añadir amigos
 * 
 * 
*/
function MyFriendsRequestsSection({friends_requests}) {

    const {fetchRequest, loading: fetchLoading, error: fetchError} = useFetch()
    const [username, setUsername] = useState('')

    /*
    const friends_requests = [
        {"id":1,"name": "Pepe", "username": "PepeCrack"},
        {"id":2,"name": "Juan", "username": "JuanTheCool"},
    ]
    */
   console.log(friends_requests)
    // TODO Las friends no tienen el nombre de los usuarios, los tengo que sacar de users!!!!

    

    return (
        
        <section className="add-restaurant-section">
            <ul>
                {friends_requests.map(mapped_friend=>(
                <li friend={mapped_friend} key={mapped_friend.id}>{mapped_friend.username}<button>Aceptar</button></li>
                ))}
            {/* Important to add the key or other prop so that react can differentiate each element */}
            </ul>
            
            

            
        </section>

        
    )
}


export default MyFriendsRequestsSection 