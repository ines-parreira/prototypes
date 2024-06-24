import React from 'react'
import {useParams} from 'react-router-dom'
import {AiAgentPlaygroundView} from './AiAgentPlaygroundView'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'

import css from './AiAgentPlaygroundContainer.less'

export const AiAgentPlaygroundContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()

    return (
        <AiAgentLayout shopName={shopName} className={css.container}>
            <AiAgentPlaygroundView />
        </AiAgentLayout>
    )
}
