import { useState } from 'react'
import PropTypes from "prop-types";
import { useFetch } from "../../hooks/useFetch";


/**
 * AddFriendsSection
 * Componente para mostrar la sección de añadir amigos
 * 
 * 
*/
function AddFriendsSection() {

    const {fetchRequest, loading: fetchLoading, error: fetchError} = useFetch()
    const [username, setUsername] = useState('')

    const addFriendSubmit = async (event) => {
        event.preventDefault();
        console.log("AddFriendSubmit")
        const name = username
        
        const result = await fetchRequest("/friends/request", {
            method: "POST",
            body: JSON.stringify({
                name,
            }),
        })
        if (result.success){
            console.log("Success:", result.data)
        } else {
            console.log("Error:", result.error);
        }
    }

    return (
        
        <section className="add-restaurant-section">
            <h2>Mis amigos</h2>
            <form autoComplete='off' onSubmit={addFriendSubmit}>
                <input 
                type="text"
                id="username"
                name="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}/>
                <button type='submit'>Añadir</button>   
            </form>

            
        </section>

        
    )
}


export default AddFriendsSection