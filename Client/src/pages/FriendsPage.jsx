import { useState } from "react"
import NavBar from "../components/NavBar"
import { useAuth } from '../context/AuthContext'
import { useAuthGuard } from '../hooks/useAuthGuard'
import AddFriendsSection from "../components/Friends/AddFriendsSection"
import MyFriendsSection from "../components/Friends/MyFriendsSection"
import MyFriendsRequestsSection from "../components/Friends/MyFriendsRequestsSection"




function FriendsPage() {
    //Load currentUser or redirect to LoginPage when not logged in
    const {currentUser } = useAuth()
    useAuthGuard()

    return (<>
    
        <div className="profile-cointaner">
            <h1>Mis Amigos - {currentUser ? currentUser.username : 'Cargando...'}</h1>
            
            {/* PARTE 1: Añadir amigos */}
            <AddFriendsSection/>

            {/* PARTE 2: Ver amigos */}
            <MyFriendsRequestsSection/>

            {/* PARTE 3: Ver amigos */}
            <MyFriendsSection/>
        </div>
    </>)
}

export default FriendsPage