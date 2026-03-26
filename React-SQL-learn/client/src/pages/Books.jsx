import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function Books () {
    const [books, setBooks] = useState([])

    useEffect(() => {
        const fetchAllBooks = async () => {
            
            const response = await fetch("http://localhost:8081/books")
            if (!response.ok){
                console.log("error:", response.status);
            }

            const result = await response.json();
            console.log("Book.js",result);
           setBooks(result);
        }
        fetchAllBooks()
    }, [])

    

    return <div>
        Books
        <div className="books" >
            {books.map(book=>(
                <div key={book.id}>
                    {book.cover && <img src={book.cover} alt="" />}
                    <h2>{book.title}</h2>
                    <p>{book.description}</p>
                    <span>{book.price}</span>
                </div>
            ))}
        </div>
        <Link to="/add">Add new Book</Link>
        </div>
}

export default Books