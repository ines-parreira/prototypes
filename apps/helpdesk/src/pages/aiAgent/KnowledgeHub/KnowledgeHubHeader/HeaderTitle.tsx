import { Link, useLocation } from 'react-router-dom'

import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'

import css from './KnowledgeHubHeader.less'

type HeaderTitleProps = {
    data: GroupedKnowledgeItem | null
    knowledgeRoute: string
}

export const HeaderTitle = ({ data, knowledgeRoute }: HeaderTitleProps) => {
    const location = useLocation()

    if (data === null) {
        // Preserve filter when navigating back to knowledge
        const knowledgeRouteWithFilter =
            location.search && location.search.includes('filter')
                ? `${knowledgeRoute}${location.search}`
                : knowledgeRoute

        return (
            <div className={css.title}>
                <Link to={knowledgeRouteWithFilter} className={css.titleLink}>
                    Knowledge
                </Link>
            </div>
        )
    }

    return (
        <div className={css.title}>
            <span className={css.titleText}>{data.title}</span>
        </div>
    )
}
