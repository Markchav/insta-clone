import { GlobalDispatchContext } from '@/state/context/GlobalContext'
import React, { useContext } from 'react'

export default function NavIcon({Icon,name}) {
    const dispatch = useContext(GlobalDispatchContext)

    const handleClickIcon = ()=> {
        if(name === 'Create') {
            dispatch({
                type:'SET_IS_UPLOAD_POST_MODAL_OPEN', 
                payload: {
                    isUploadPostModalOpen:true
                }
            })
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