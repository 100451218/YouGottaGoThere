import { useState } from "react";

function CreateRestaurantForm () 
{

    const [restaurantName, setRestaurantName] = useState('')

    return <div id="create-restaurant-form">
        Create restaurant <form action="">
            <input
                type="text"
                id="restaurantName"
                name="restaurantName"
                placeholder="restaurantName"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
            />
            
        </form>
    </div>
}

export default CreateRestaurantForm;