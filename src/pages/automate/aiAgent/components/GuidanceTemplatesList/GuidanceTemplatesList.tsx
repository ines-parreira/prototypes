import React from 'react'
import history from 'pages/history'
import {GuidanceTemplate, GuidanceTemplateKey} from '../../types'
import {GuidanceTemplateCard} from '../GuidanceTemplateCard/GuidanceTemplateCard'
import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'
import {CreateNewGuidanceCard} from '../CreateNewGuidanceCard/CreateNewGuidanceCard'
import css from './GuidanceTemplatesList.less'

type Props = {
    guidanceTemplates: GuidanceTemplate[]
    shopName: string
}

export const GuidanceTemplatesList = ({guidanceTemplates, shopName}: Props) => {
    const {routes} = useAiAgentNavigation({shopName})

    const onTemplateClick = (templateId: GuidanceTemplateKey) => {
        history.push(routes.newGuidanceTemplateArticle(templateId))
    }

    return (
        <ul className={css.container}>
            {guidanceTemplates.map((template) => (
                <li key={template.id}>
                    <GuidanceTemplateCard
                        onClick={() => onTemplateClick(template.id)}
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
