import { useFetch } from "../../hooks/useFetch"
import { useTags } from "../../hooks/useTags"
import '../../css/RestaurantRecomendation.css'


function RestaurantRecomendation({friend_review}) {
    const { fetchRequest } = useFetch()
    const { allTags} = useTags(fetchRequest)
    //allTags obtiene a través del hook todas las tags en forma de una lista de {id, name}
    
    console.log(allTags)
    const getTagName = (tagId) => {
        const tag = allTags.find(t => t.id === tagId)
        return tag ? tag.name : `Tag ${tagId}`
    }

    return (
    <div className="recomendation-container">
                <h3>{friend_review.restaurant_name}</h3> (Ubicación: {friend_review.locationx}, {friend_review.locationy})
                <br />
                Es el top {friend_review.ranking} de tu amigo <strong>{friend_review.username}</strong>
                <br />
                Review: {friend_review.description}
                <hr />
                {friend_review.tags && (<div className="tags-list">
                    {
                        JSON.parse(friend_review.tags).map((elem)=>{
                            return (<div key={elem} className="tag-chip">{getTagName(elem)}</div>)
                        })
                    }
                </div>)}
            </div>
    )
}


export default RestaurantRecomendation