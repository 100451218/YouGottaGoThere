


function RestaurantRecomendation({friend_review}) {

    console.log(typeof(friend_review.user_id))
    return (
    <div >
                <strong>{friend_review.restaurant_name}</strong> (Ubicación: {friend_review.locationx}, {friend_review.locationy})
                <br />
                Es el top {friend_review.ranking} de tu amigo <strong>{friend_review.username}</strong>
                <br />
                Review: {friend_review.description}
                <hr />
            </div>
    )
}


export default RestaurantRecomendation