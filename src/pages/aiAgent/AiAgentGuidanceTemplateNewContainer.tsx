import React from 'react'

import { Redirect, useParams } from 'react-router-dom'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { AiAgentGuidanceTemplateNewView } from './AiAgentGuidanceTemplateNewView'
import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { GuidanceBreadcrumbs } from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'
import { useAiAgentHelpCenter } from './hooks/useAiAgentHelpCenter'
import { useAiAgentNavigation } from './hooks/useAiAgentNavigation'
import { useGuidanceTemplate } from './hooks/useGuidanceTemplate'

import css from './AiAgentMainViewContainer.less'

export const AiAgentGuidanceTemplateNewContainer = () => {
    const { shopName, templateId } = useParams<{
        shopName: string
        templateId: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })
    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })
    const { guidanceTemplate } = useGuidanceTemplate(templateId)

    if (!guidanceTemplate) {
        return <Redirect to={routes.guidanceTemplates} />
    }

    if (!guidanceHelpCenter) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
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
