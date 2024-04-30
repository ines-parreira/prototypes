import React from 'react'
import {Link} from 'react-router-dom'
import {CustomCard} from 'pages/common/components/TemplateCard'
import history from 'pages/history'
import {GuidanceTemplate, GuidanceTemplateKey} from '../../types'
import {GuidanceTemplateCard} from '../GuidanceTemplateCard/GuidanceTemplateCard'
import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'
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
                <Link to={routes.newGuidanceArticle} className={css.link}>
                    <CustomCard
                        title="Custom Guidance"
                        description="Create a guidance for your specific requirements"
                    />
                </Link>
            </li>
        </ul>
    )
}
