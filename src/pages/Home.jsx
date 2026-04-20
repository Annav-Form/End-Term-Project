//https://dev.to/gladiatorsbattle/building-a-scalable-web-app-with-react-firebase-and-github-actions-4ejj
//React Firebase config

//https://github.com/the-road-to-react-with-firebase/the-road-to-react-with-firebase
//Guide to firebase

//https://github.com/gregfenton/react-and-user-profiles-with-firebase-auth-and-firestore


// I guess we do not use firebase for authentication, rather we just ask the user for his username
// and then fetch the details. A firebase authentication for just a CF wrapper sounds too much. 
// But ig we can have it to store the info of the user in the firebase DB tho. 
// User chats with the AI assistant, liked problems, user progress and stuff can be cached ig 


import useProblems from "../hooks/useProblems";
import { useState } from "react";
import {Link} from 'react-router-dom'
function Home(){
    return (
        <>
            <nav>
                <div>
                    <Link path='/'>Home</Link>
                </div>
            </nav>
        </>
    )
}