import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { GroupedKnowledgeItem } from '../types'
import { HeaderActions } from './ActionButtons'
import { BackButton } from './BackButton'
import { HeaderTitle } from './HeaderTitle'
import { LastSyncedDate } from './LastSyncedDate'

import css from './KnowledgeHubHeader.less'

export type KnowledgeHubHeaderProps = {
    data: GroupedKnowledgeItem | null
    shopName: string
    onAddKnowledge?: () => void
    onTest?: () => void
    onSync?: () => void
    onDelete?: () => void
    isTestButtonDisabled?: boolean
    isAddKnowledgeButtonDisabled?: boolean
    isSyncButtonDisabled?: boolean
    isDeleteButtonDisabled?: boolean
}

export const KnowledgeHubHeader = ({
    shopName,
    data,
    onAddKnowledge,
    onTest,
    onSync,
    onDelete,
    isTestButtonDisabled,
    isAddKnowledgeButtonDisabled,
    isSyncButtonDisabled,
    isDeleteButtonDisabled,
}: KnowledgeHubHeaderProps) => {
    const { routes } = useAiAgentNavigation({ shopName })

    return (
        <div className={css.header}>
            <div className={css.leftSection}>
                <BackButton knowledgeRoute={routes.knowledge} data={data} />
            </div>
            <div className={css.middleSection}>
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
                />
            </div>
        </div>
    )
}
