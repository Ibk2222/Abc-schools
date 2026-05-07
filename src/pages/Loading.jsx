
import React from 'react'
import { Loader2 } from 'lucide-react'


const Loading = () => {
  return (
     <div>
            <Loader2 
            size={32}
            style={{ animation: "spin 1s linear infinite" }} />
          </div>
  )
}

export default Loading