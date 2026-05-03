function NotTopUserRestaurants ({restaurants, onChangeRanking}) {
    console.log(restaurants)

    function onRankRestaurant(ranking, id) {
        console.log("restaurant", id, "is now rated ", ranking)
        if (ranking && id){
            onChangeRanking(ranking,id)
        }
    }
    return (<>
        <ul>
            {restaurants.map((restaurant)=>{
                if (restaurant.ranking == null){
                    return (
                    <li key={restaurant.id}>{restaurant.name}
                        <select defaultValue="" onChange={(e) => onRankRestaurant(e.target.value, restaurant.id)}>
                            <option value="" >no top</option>
                            <option value="1">#1</option>
                            <option value="2">#2</option>
                            <option value="3">#3</option>
                            <option value="4">#4</option>
                            <option value="5">#5</option>
                        </select></li>
                )
                }
                
            })}
        </ul>
    </>)
}


export default NotTopUserRestaurants