import React from 'react'
import {useParams} from 'react-router-dom'
import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'

import css from './ActionEventsView.less'

export default function ActionExecutionsView() {
    const {shopName} = useParams<{
        id: string
        shopType: string
        shopName: string
    }>()

    return (
        <AiAgentLayout shopName={shopName} className={css.container}>
            <div>TODO</div>
        </AiAgentLayout>
    )
}
