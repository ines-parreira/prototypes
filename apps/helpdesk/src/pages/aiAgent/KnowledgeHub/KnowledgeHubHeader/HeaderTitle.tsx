import { Link } from 'react-router-dom'

import { KnowledgeHubHeaderData } from './KnowledgeHubHeader'

import css from './KnowledgeHubHeader.less'

type HeaderTitleProps = {
    data: KnowledgeHubHeaderData | null
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
            <span className={css.titleText}>{data.name}</span>
        </div>
    )
}
