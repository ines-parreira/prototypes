import React from 'react'
import {Redirect, useParams} from 'react-router-dom'
import Loader from 'pages/common/components/Loader/Loader'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {useAiAgentHelpCenter} from './hooks/useAiAgentHelpCenter'
import {AiAgentGuidanceTemplateNewView} from './AiAgentGuidanceTemplateNewView'
import {GuidanceBreadcrumbs} from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'
import {useGuidanceTemplate} from './hooks/useGuidanceTemplate'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'

export const AiAgentGuidanceTemplateNewContainer = () => {
    const {shopName, templateId} = useParams<{
        shopName: string
        templateId: string
    }>()
    const {routes} = useAiAgentNavigation({shopName})
    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })
    const {guidanceTemplate} = useGuidanceTemplate(templateId)

    if (!guidanceTemplate) {
        return <Redirect to={routes.guidanceTemplates} />
    }

    if (!guidanceHelpCenter) {
        return <Loader data-testid="loader" />
    }

    return (
        <AiAgentLayout
            title={
                <GuidanceBreadcrumbs shopName={shopName} title="New guidance" />
            }
            shopName={shopName}
        >
            <AiAgentGuidanceTemplateNewView
                guidanceHelpCenterId={guidanceHelpCenter.id}
                locale={guidanceHelpCenter.default_locale}
                shopName={shopName}
                guidanceTemplate={guidanceTemplate}
            />
        </AiAgentLayout>
    )
}
