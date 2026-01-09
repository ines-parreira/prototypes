import { useId } from '@repo/hooks'
import classNames from 'classnames'

import { Icon, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'
import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'

import css from './KnowledgeHubHeader.less'

type HeaderActionsProps = {
    data: GroupedKnowledgeItem | null
    onAddKnowledge?: () => void
    onTest?: () => void
    onSync?: () => void
    onDelete?: () => void
    isTestButtonDisabled?: boolean
    isAddKnowledgeButtonDisabled?: boolean
    isSyncButtonDisabled?: boolean
    isDeleteButtonDisabled?: boolean
    syncTooltipMessage?: string
    isPlaygroundOpen?: boolean
}

export const HeaderActions = ({
    data,
    onAddKnowledge,
    onTest,
    onSync,
    onDelete,
    isTestButtonDisabled = false,
    isAddKnowledgeButtonDisabled = false,
    isSyncButtonDisabled = false,
    isDeleteButtonDisabled = false,
    syncTooltipMessage,
    isPlaygroundOpen = false,
}: HeaderActionsProps) => {
    const id = useId()
    const syncButtonId = `sync-button-${id}`
    if (!data) {
        return (
            <>
                <button
                    className={classNames(css.button, css.primaryButton)}
                    onClick={onAddKnowledge}
                    disabled={isAddKnowledgeButtonDisabled}
                    aria-label="Add new knowledge"
                >
                    <Icon name="add-plus" /> <span>New knowledge</span>
                </button>
                {!isPlaygroundOpen && (
                    <button
                        className={classNames(css.button, css.secondaryButton)}
                        onClick={onTest}
                        disabled={isTestButtonDisabled}
                        aria-label="Test knowledge"
                    >
                        Test
                    </button>
                )}
            </>
        )
    }

    switch (data.type) {
        case KnowledgeType.Domain:
            return (
                <>
                    <button
                        id={syncButtonId}
                        className={classNames(css.button, css.secondaryButton)}
                        onClick={onSync}
                        disabled={isSyncButtonDisabled}
                        aria-label="Sync store website"
                    >
                        <Icon name="arrows-reload-alt-1" />{' '}
                        <span>Sync store website</span>
                    </button>
                    {syncTooltipMessage && (
                        <Tooltip target={syncButtonId}>
                            {syncTooltipMessage}
                        </Tooltip>
                    )}
                </>
            )
        case KnowledgeType.URL:
            return (
                <>
                    <button
                        id={syncButtonId}
                        className={classNames(css.button, css.secondaryButton)}
                        onClick={onSync}
                        disabled={isSyncButtonDisabled}
                        aria-label="Sync URL"
                    >
                        <Icon name="arrows-reload-alt-1" />{' '}
                        <span>Sync URL</span>
                    </button>
                    {syncTooltipMessage && (
                        <Tooltip target={syncButtonId}>
                            {syncTooltipMessage}
                        </Tooltip>
                    )}
                    <button
                        className={classNames(
                            css.button,
                            css.iconOnlyButton,
                            css.destructiveButton,
                        )}
                        onClick={onDelete}
                        disabled={isDeleteButtonDisabled}
                        aria-label="Delete URL"
                    >
                        <Icon size={'md'} name="trash-empty" />
                    </button>
                </>
            )
        case KnowledgeType.Document:
            return (
                <button
                    className={classNames(
                        css.button,
                        css.iconOnlyButton,
                        css.destructiveButton,
                    )}
                    onClick={onDelete}
                    disabled={isDeleteButtonDisabled}
                    aria-label="Delete document"
                >
                    <Icon size={'md'} name="trash-empty" />
                </button>
            )
    }

    return null
}
