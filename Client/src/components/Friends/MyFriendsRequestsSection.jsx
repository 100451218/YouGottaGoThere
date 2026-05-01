import { useState } from 'react'
import PropTypes from "prop-types";
import { useFetch } from "../../hooks/useFetch";


/**
 * AddFriendsSection
 * Componente para mostrar la sección de añadir amigos
 * 
 * 
*/
function MyFriendsRequestsSection({friends_requests, users_list, onAccept}) {

    const {fetchRequest, loading: fetchLoading, error: fetchError} = useFetch()
    const [username, setUsername] = useState('')

    console.log("friends requests from parent", friends_requests, users_list)
    return (
        
        <section className="add-restaurant-section">
            <h2>Solicitudes de amistad</h2>
            <ul>
                {friends_requests.map((mapped_friend) => {
                    const user_data = users_list.find((u) => u.id === mapped_friend.user_id_1);
                    //console.log("user data:", mapped_friend, user_data)
                    return (
                        <li key={mapped_friend.user_id_1}>{user_data.username}<button onClick={() => onAccept(mapped_friend.user_id_1)}>Aceptar</button></li>
                    )
                })}
            {/* Important to add the key or other prop so that react can differentiate each element */}
            </ul>
            
            

            
        </section>

        
    )
}


export default MyFriendsRequestsSection 