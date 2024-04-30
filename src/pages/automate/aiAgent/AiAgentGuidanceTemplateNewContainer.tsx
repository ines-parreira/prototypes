import React from 'react'
import {Redirect, useParams} from 'react-router-dom'
import Loader from 'pages/common/components/Loader/Loader'
import AutomateView from '../common/components/AutomateView'
import {AI_AGENT} from '../common/components/constants'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {useGuidanceHelpCenter} from './hooks/useGuidanceHelpCenter'
import {AiAgentGuidanceTemplateNewView} from './AiAgentGuidanceTemplateNewView'
import {isGuidanceTemplateKey} from './types'

export const AiAgentGuidanceTemplateNewContainer = () => {
    const {shopName, templateId} = useParams<{
        shopName: string
        templateId: string
    }>()
    const {routes, headerNavbarItems} = useAiAgentNavigation({shopName})
    const guidanceHelpCenter = useGuidanceHelpCenter({shopName})

    if (!isGuidanceTemplateKey(templateId)) {
        return <Redirect to={routes.guidanceTemplates} />
    }

    if (!guidanceHelpCenter) {
        return <Loader data-testid="loader" />
    }

    return (
        <AutomateView title={AI_AGENT} headerNavbarItems={headerNavbarItems}>
            <AiAgentGuidanceTemplateNewView
                guidanceHelpCenterId={guidanceHelpCenter.id}
                locale={guidanceHelpCenter.default_locale}
                shopName={shopName}
                templateId={templateId}
            />
        </AutomateView>
    )
}
