import React from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import history from 'pages/history'

import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'
import { GuidanceTemplate } from '../../types'
import { CreateNewGuidanceCard } from '../CreateNewGuidanceCard/CreateNewGuidanceCard'
import { GuidanceTemplateCard } from '../GuidanceTemplateCard/GuidanceTemplateCard'

import css from './GuidanceTemplatesList.less'

type Props = {
    guidanceTemplates: GuidanceTemplate[]
    shopName: string
    source?: string
}

export const GuidanceTemplatesList = ({
    guidanceTemplates,
    shopName,
    source,
}: Props) => {
    const { routes } = useAiAgentNavigation({ shopName })

    const onTemplateClick = (template: GuidanceTemplate) => {
        logEvent(SegmentEvent.AiAgentGuidanceCardClicked, {
            source: source ?? 'library',
            type: 'template',
            name: template.name,
        })
        history.push(routes.newGuidanceTemplateArticle(template.id))
    }

    return (
        <ul className={css.container}>
            {guidanceTemplates.map((template) => (
                <li key={template.id}>
                    <GuidanceTemplateCard
                        onClick={() => onTemplateClick(template)}
                        guidanceTemplate={template}
                    />
                </li>
            ))}
            <li>
                <CreateNewGuidanceCard shopName={shopName} />
            </li>
        </ul>
    )
}
