function NotTopUserRestaurants ({restaurants}) {
    console.log(restaurants)
    return (<>
        <ul>
            {restaurants.map((restaurant)=>{
                if (restaurant.ranking == null){
                    return (
                    <li key={restaurant.id}>{restaurant.name}</li>
                )
                }
                
            })}
        </ul>
    </>)
}


export default NotTopUserRestaurants