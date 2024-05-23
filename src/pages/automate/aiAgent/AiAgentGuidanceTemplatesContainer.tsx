import React from 'react'
import {useParams} from 'react-router-dom'
import Loader from 'pages/common/components/Loader/Loader'
import {useGuidanceHelpCenter} from './hooks/useGuidanceHelpCenter'
import {AiAgentGuidanceTemplatesView} from './AiAgentGuidanceTemplatesView'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'
import css from './AiAgentGuidanceTemplatesContainer.less'

export const AiAgentGuidanceTemplatesContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const guidanceHelpCenter = useGuidanceHelpCenter({shopName})

    if (!guidanceHelpCenter) {
        return <Loader data-testid="loader" />
    }

    return (
        <AiAgentLayout shopName={shopName} className={css.container}>
            <AiAgentGuidanceTemplatesView shopName={shopName} />
        </AiAgentLayout>
    )
}
