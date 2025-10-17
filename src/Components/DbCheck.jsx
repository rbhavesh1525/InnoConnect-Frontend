
import React, { useEffect } from 'react';
import { supabase } from '../SupabaseClient';


function DBCheck() {



    useEffect(() => { 

try {
    if(supabase){
        console.log("Supabase connected");
    }
    else{
        console.log("Supabase not connected");
    }
} catch (error) {
    console.log("Error connecting to Supabase", error);
}



    },[])
    return (
        <>
          <div>Check console for Supabase connection status</div>
          </>
    )
}

export default DBCheck;