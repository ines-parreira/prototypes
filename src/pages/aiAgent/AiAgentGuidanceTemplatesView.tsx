import React from 'react'

import BackLink from 'pages/common/components/BackLink'

import {GuidanceTemplatesList} from './components/GuidanceTemplatesList/GuidanceTemplatesList'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {useGuidanceTemplates} from './hooks/useGuidanceTemplates'

type Props = {
    shopName: string
}

export const AiAgentGuidanceTemplatesView = ({shopName}: Props) => {
    const {guidanceTemplates} = useGuidanceTemplates()
    const {routes} = useAiAgentNavigation({shopName})

    return (
        <>
            <BackLink path={routes.guidance} label="Back to Guidance" />

            <h3 className="heading-section-semibold mb-0">
                Start with a template that you can customize to fit your needs
            </h3>

            <GuidanceTemplatesList
                guidanceTemplates={guidanceTemplates}
                shopName={shopName}
            />
        </>
    )
}
