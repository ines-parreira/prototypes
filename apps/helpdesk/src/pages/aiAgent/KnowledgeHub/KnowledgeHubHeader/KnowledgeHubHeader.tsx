import classNames from 'classnames'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import type { GroupedKnowledgeItem } from '../types'
import { HeaderActions } from './ActionButtons'
import { BackButton } from './BackButton'
import { HeaderTitle } from './HeaderTitle'
import { LastSyncedDate } from './LastSyncedDate'

import css from './KnowledgeHubHeader.less'

export type KnowledgeHubHeaderProps = {
    data: GroupedKnowledgeItem | null
    shopName: string
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
    shopName,
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
    const { routes } = useAiAgentNavigation({ shopName })

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
                <HeaderTitle data={data} knowledgeRoute={routes.knowledge} />
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
