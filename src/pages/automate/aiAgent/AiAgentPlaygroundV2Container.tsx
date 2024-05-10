import React from 'react'
import {useParams} from 'react-router-dom'
import {AiAgentPlaygroundV2View} from './AiAgentPlaygroundV2View'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'

export const AiAgentPlaygroundContainerV2 = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()

    return (
        <AiAgentLayout shopName={shopName}>
            <AiAgentPlaygroundV2View />
        </AiAgentLayout>
    )
}
