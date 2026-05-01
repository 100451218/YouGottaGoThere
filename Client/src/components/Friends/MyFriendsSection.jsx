import { useState } from 'react'
import PropTypes from "prop-types";
import { useFetch } from "../../hooks/useFetch";


/**
 * AddFriendsSection
 * Componente para mostrar la sección de añadir amigos
 * 
 * 
*/
function MyFriendsSection({friends, users_list, onDelete, currentUser}) {

    const {fetchRequest, loading: fetchLoading, error: fetchError} = useFetch()
    const [username, setUsername] = useState('')

    console.log("friends from parent", friends, users_list, currentUser)
    

    return (
        
        <section className="add-restaurant-section">
            <h2>Mis amigos</h2>
            <ul>
                {friends.map((mapped_friend)=>{
                    const friend_id = (mapped_friend.user_id_1 != currentUser.id) ? (mapped_friend.user_id_1) : (mapped_friend.user_id_2)  
                    const user_data = users_list.find((u) => u.id === friend_id)
                    return (
                        <li key={mapped_friend.user_id_1}>{user_data.username}<button onClick={() => onDelete(friend_id)}>Eliminar</button></li>
                    )
                }
                )}
            </ul>
  
        </section>

        
    )
}

export default MyFriendsSection 