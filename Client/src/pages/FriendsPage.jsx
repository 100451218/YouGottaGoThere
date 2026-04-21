import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { useAuthGuard } from '../hooks/useAuthGuard'
import AddFriendsSection from "../components/Friends/AddFriendsSection"
import MyFriendsSection from "../components/Friends/MyFriendsSection"
import MyFriendsRequestsSection from "../components/Friends/MyFriendsRequestsSection"




function FriendsPage() {
    //Load currentUser or redirect to LoginPage when not logged in
    const {currentUser } = useAuth()
    useAuthGuard()

    const {fetchRequest, loading: fetchLoading, error: fetchError } = useFetch()

    // Estado: Amigos del usuario
    const [userFriends, setUserFriends] = useState([])
    const [userFriendRequests, setUserFriendRequests] =  useState([])

    //useEffect() => Operations that affect something outside the scope of the function being executed, such as fetching data
    useEffect(() => {
        if (currentUser) {
            loadUserFriends()
        }
    }, [currentUser])
    // Whenever the currentUser changes, we rerun this use Effect


    //API: Cargar todas las amistades del usuario (las aceptadas y las solicitadas)
    const loadUserFriends = async () => {
        const result = await fetchRequest("/friends")
        console.log(result)
        if (result.success) {
            let all_friends = result.data
            let all_accepted_friends = []
            let all_friends_requests = []
            all_friends.forEach(friendship => {
                if (friendship.status == "pending"){
                    all_friends_requests.push(friendship)
                } else if (friendship.status == "accepted") {
                    all_accepted_friends.push(friendship)
                }
            });
            console.log("Accepted friendships", all_accepted_friends)
            console.log("Requested friendships", all_friends_requests)
            setUserFriends(all_accepted_friends)
            setUserFriendRequests(all_friends_requests)
        }
    }
    //TODO hacer que ahora se pase a cada uno de los componentes las respectivas listas de amistad

    return (<>
    
        <div className="profile-cointaner">
            <h1>Mis Amigos - {currentUser ? currentUser.username : 'Cargando...'}</h1>
            
            {/* PARTE 1: Añadir amigos */}
            <AddFriendsSection/>

            {/* PARTE 2: Ver amigos */}
            <MyFriendsRequestsSection 
            friends_requests = {userFriendRequests}/>

            {/* PARTE 3: Ver amigos */}
            <MyFriendsSection/>
        </div>
    </>)
}

export default FriendsPage