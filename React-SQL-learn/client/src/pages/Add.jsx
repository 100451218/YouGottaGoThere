import { useState } from "react"

function Add () {
    const [book, setBook] = useState({
        title: "",
        description: "",
        cover: "",
    })

    const handleChange = (e) => {
        setBook((prev) => ({...prev, [e.target.name]: e.target.value}))
    }
    console.log(book);

    const handleButtonClick = async (e) => {
        e.preventDefault()
        try {
            await fetch("http://localhost:8081/books", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(book),
            })
        } catch {
            console.log("Error")
        }
    }
    return (
    <div className="add-form">
        <h1>Add new book</h1>
        <input type="text" placeholder="name" onChange={handleChange} name="title"/>
        <input type="text" placeholder="description" onChange={handleChange} name="description"/>
        <input type="text" placeholder="cover" onChange={handleChange} name="cover"/>

        <button onClick={handleButtonClick}>Add</button>
    </div>
    )
}

export default Add