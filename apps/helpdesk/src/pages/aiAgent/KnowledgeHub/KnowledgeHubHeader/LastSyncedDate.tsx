import { getFormattedDate } from 'utils/date'

import { KnowledgeHubHeaderData } from './KnowledgeHubHeader'

import css from './KnowledgeHubHeader.less'

type LastSyncedDateProps = {
    data: KnowledgeHubHeaderData | null
}

export const LastSyncedDate = ({ data }: LastSyncedDateProps) => {
    if (!data) {
        return null
    }
    if (!data.lastSyncedDate) {
        return null
    }

    const formattedDate = getFormattedDate(data.lastSyncedDate)

    return (
        <span className={css.lastSyncedText}>Last synced {formattedDate}</span>
    )
}
