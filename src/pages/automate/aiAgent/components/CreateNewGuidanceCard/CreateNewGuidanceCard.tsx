import React from 'react'
import {Link} from 'react-router-dom'

import {CustomCard} from 'pages/common/components/TemplateCard'

import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'
import css from './CreateNewGuidanceCard.less'

type Props = {
    shopName: string
}

export const CreateNewGuidanceCard = ({shopName}: Props) => {
    const {routes} = useAiAgentNavigation({shopName})
    return (
        <Link to={routes.newGuidanceArticle} className={css.link}>
            <CustomCard title="Create custom Guidance" showOnlyTitle />
        </Link>
    )
}
