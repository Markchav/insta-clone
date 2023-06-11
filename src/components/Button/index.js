import React from 'react'

export default function Button({children,disabled}) {
return (
    <button type='submit' className='className=w-full h-full text-center bg-[#0095F6]' disabled={disabled} >{children}</button>

)
}
