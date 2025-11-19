import { Link } from 'react-router-dom'

import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'

import css from './KnowledgeHubHeader.less'

type HeaderTitleProps = {
    data: GroupedKnowledgeItem | null
    knowledgeRoute: string
}

export const HeaderTitle = ({ data, knowledgeRoute }: HeaderTitleProps) => {
    if (data === null) {
        return (
            <div className={css.title}>
                <Link to={knowledgeRoute} className={css.titleLink}>
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
