import classNames from 'classnames'

import { HeaderActions } from 'pages/aiAgent/KnowledgeHub/KnowledgeHubHeader/ActionButtons'
import { BackButton } from 'pages/aiAgent/KnowledgeHub/KnowledgeHubHeader/BackButton'
import { HeaderTitle } from 'pages/aiAgent/KnowledgeHub/KnowledgeHubHeader/HeaderTitle'
import { LastSyncedDate } from 'pages/aiAgent/KnowledgeHub/KnowledgeHubHeader/LastSyncedDate'
import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'

import css from './KnowledgeHubHeader.less'

export type KnowledgeHubHeaderProps = {
    data: GroupedKnowledgeItem | null
    onBack: () => void
    onAddKnowledge?: () => void
    onTest?: () => void
    onSync?: () => void
    onDelete?: () => void
    isTestButtonDisabled?: boolean
    isAddKnowledgeButtonDisabled?: boolean
    isSyncButtonDisabled?: boolean
    isDeleteButtonDisabled?: boolean
    syncTooltipMessage?: string
}

export const KnowledgeHubHeader = ({
    data,
    onBack,
    onAddKnowledge,
    onTest,
    onSync,
    onDelete,
    isTestButtonDisabled,
    isAddKnowledgeButtonDisabled,
    isSyncButtonDisabled,
    isDeleteButtonDisabled,
    syncTooltipMessage,
}: KnowledgeHubHeaderProps) => {
    const hasLeftSection = !!data
    const hasRightSection = true // Right section always has content

    return (
        <div className={css.header}>
            <div
                className={classNames(css.leftSection, {
                    [css.leftSectionVisible]: hasLeftSection,
                })}
            >
                <BackButton data={data} onBack={onBack} />
            </div>
            <div
                className={classNames(css.middleSection, {
                    [css.middleSectionWithLeftMargin]: hasLeftSection,
                    [css.middleSectionWithRightMargin]: hasRightSection,
                })}
            >
                <HeaderTitle data={data} />
                <LastSyncedDate data={data} />
            </div>
            <div className={css.rightSection}>
                <HeaderActions
                    data={data}
                    onAddKnowledge={onAddKnowledge}
                    onTest={onTest}
                    onSync={onSync}
                    onDelete={onDelete}
                    isTestButtonDisabled={isTestButtonDisabled}
                    isAddKnowledgeButtonDisabled={isAddKnowledgeButtonDisabled}
                    isSyncButtonDisabled={isSyncButtonDisabled}
                    isDeleteButtonDisabled={isDeleteButtonDisabled}
                    syncTooltipMessage={syncTooltipMessage}
                />
            </div>
        </div>
    )
}
