import { useState } from "react"

/*
    For the toolbar, I want:

    Search bar --> text input with an onchange
    An order by dropdown button
    Tags 


*/
function ToolBar(userRecomendations) {

    console.log(userRecomendations)

    // Search term state
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState([])

    const handleSearch = () => {
        console.log("Handle search")
    }

    return (
        <div id="tool-bar-container">
            
        </div>
    )
}

export default ToolBar