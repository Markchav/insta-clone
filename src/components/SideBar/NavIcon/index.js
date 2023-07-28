import React, { useContext } from 'react'
import { GlobalDispatchContext } from '@/state/context/GlobalContext'


export default function NavIcon({Icon,name}) {
    const dispatch = useContext(GlobalDispatchContext)

    const handleClickIcon = async ()=> {
        if(name === 'Create') {
            dispatch({
                type:'SET_IS_UPLOAD_POST_MODAL_OPEN', 
                payload: {
                    isUploadPostModalOpen:true
                }
            })
        }
        if(name === 'Home') {
            window.location= '/'
        }
    }
    
return (
    <div onClick={handleClickIcon} className='flex flex-row items-center my-[5px] mx-[5px] py-[10px] px-[15px] rounded-[15px] w-full hover:cursor-pointer hover:bg-gray-200 transition'>
<Icon
        size={25}
    />
    <div className='ml-3'>
    {name} 
    </div>
    </div>    
)
}