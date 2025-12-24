import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'
import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'

import css from './KnowledgeHubHeader.less'

type HeaderTitleProps = {
    data: GroupedKnowledgeItem | null
}

export const HeaderTitle = ({ data }: HeaderTitleProps) => {
    if (data === null) {
        return (
            <div className={css.title}>
                <TruncatedTextWithTooltip tooltipContent={'Knowledge'}>
                    <div className={css.titleLink}>Knowledge</div>
                </TruncatedTextWithTooltip>
            </div>
        )
    }

    return (
        <div className={css.title}>
            <TruncatedTextWithTooltip tooltipContent={data.title}>
                <span className={css.titleText}>{data.title}</span>
            </TruncatedTextWithTooltip>
        </div>
    )
}
