import { getFormattedDate } from 'utils/date'

import type { GroupedKnowledgeItem } from '../types'

import css from './KnowledgeHubHeader.less'

type LastSyncedDateProps = {
    data: GroupedKnowledgeItem | null
}

export const LastSyncedDate = ({ data }: LastSyncedDateProps) => {
    if (!data) {
        return null
    }
    if (!data.lastUpdatedAt) {
        return null
    }

    const formattedDate = getFormattedDate(data.lastUpdatedAt)

    return (
        <span className={css.lastSyncedText}>Last synced {formattedDate}</span>
    )
}
