import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'

import css from './KnowledgeHubHeader.less'

type HeaderTitleProps = {
    data: GroupedKnowledgeItem | null
}

export const HeaderTitle = ({ data }: HeaderTitleProps) => {
    if (data === null) {
        return (
            <div className={css.title}>
                <div className={css.titleLink}>Knowledge</div>
            </div>
        )
    }

    return (
        <div className={css.title}>
            <span className={css.titleText}>{data.title}</span>
        </div>
    )
}
