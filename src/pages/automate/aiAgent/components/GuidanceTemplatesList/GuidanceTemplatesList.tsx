import React from 'react'
import {Link} from 'react-router-dom'
import {CustomCard} from 'pages/common/components/TemplateCard'
import {GuidanceTemplate} from '../../types'
import {GuidanceTemplateCard} from '../GuidanceTemplateCard/GuidanceTemplateCard'
import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'
import css from './GuidanceTemplatesList.less'

type Props = {
    guidanceTemplates: GuidanceTemplate[]
    shopName: string
}

export const GuidanceTemplatesList = ({guidanceTemplates, shopName}: Props) => {
    const {routes} = useAiAgentNavigation({shopName})
    return (
        <ul className={css.container}>
            {guidanceTemplates.map((template) => (
                <li key={template.id}>
                    <GuidanceTemplateCard guidanceTemplate={template} />
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
