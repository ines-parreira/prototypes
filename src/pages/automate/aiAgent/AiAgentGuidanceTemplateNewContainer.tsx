import React from 'react'
import {Redirect, useParams} from 'react-router-dom'
import Loader from 'pages/common/components/Loader/Loader'
import AutomateView from '../common/components/AutomateView'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {useGuidanceHelpCenter} from './hooks/useGuidanceHelpCenter'
import {AiAgentGuidanceTemplateNewView} from './AiAgentGuidanceTemplateNewView'
import {GuidanceBreadcrumbs} from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'
import {useGuidanceTemplate} from './hooks/useGuidanceTemplate'

export const AiAgentGuidanceTemplateNewContainer = () => {
    const {shopName, templateId} = useParams<{
        shopName: string
        templateId: string
    }>()
    const {routes, headerNavbarItems} = useAiAgentNavigation({shopName})
    const guidanceHelpCenter = useGuidanceHelpCenter({shopName})
    const {guidanceTemplate} = useGuidanceTemplate(templateId)

    if (!guidanceTemplate) {
        return <Redirect to={routes.guidanceTemplates} />
    }

    if (!guidanceHelpCenter) {
        return <Loader data-testid="loader" />
    }

    return (
        <AutomateView
            title={
                <GuidanceBreadcrumbs shopName={shopName} title="New guidance" />
            }
            headerNavbarItems={headerNavbarItems}
        >
            <AiAgentGuidanceTemplateNewView
                guidanceHelpCenterId={guidanceHelpCenter.id}
                locale={guidanceHelpCenter.default_locale}
                shopName={shopName}
                guidanceTemplate={guidanceTemplate}
            />
        </AutomateView>
    )
}
