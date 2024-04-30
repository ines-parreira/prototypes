import React from 'react'
import {useParams} from 'react-router-dom'
import Loader from 'pages/common/components/Loader/Loader'
import AutomateView from '../common/components/AutomateView'
import {AI_AGENT} from '../common/components/constants'
import {useGuidanceHelpCenter} from './hooks/useGuidanceHelpCenter'
import {AiAgentGuidanceTemplatesView} from './AiAgentGuidanceTemplatesView'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import css from './AiAgentGuidanceTemplatesView.less'

export const AiAgentGuidanceTemplatesContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const {headerNavbarItems} = useAiAgentNavigation({shopName})
    const guidanceHelpCenter = useGuidanceHelpCenter({shopName})

    if (!guidanceHelpCenter) {
        return <Loader data-testid="loader" />
    }

    return (
        <AutomateView
            title={AI_AGENT}
            headerNavbarItems={headerNavbarItems}
            className={css.container}
        >
            <AiAgentGuidanceTemplatesView shopName={shopName} />
        </AutomateView>
    )
}
