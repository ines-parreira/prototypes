import {
    CheckBoxField,
    Icon,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { formatIntentLabel } from '../../utils/formatIntentLabel'
import type { ApiIntent } from '../KnowledgeEditorSidePanelSectionLinkedIntentsModal'

import css from '../KnowledgeEditorSidePanelSectionLinkedIntentsModal.less'

type Props = {
    intent: ApiIntent
    ticketCount?: number
    isChecked: boolean
    onToggle: (intent: ApiIntent) => void
    guidanceEditRoute: (articleId: number) => string
}

export const IntentRow = ({
    intent,
    ticketCount,
    isChecked,
    onToggle,
    guidanceEditRoute,
}: Props) => {
    const isLinkedElsewhere = !intent.is_available && !!intent.used_by_article

    const checkboxField = (
        <div className={css.intentCheckbox}>
            <CheckBoxField
                label={formatIntentLabel(intent.intent)}
                caption={
                    isLinkedElsewhere
                        ? 'Already linked to another guidance'
                        : undefined
                }
                value={isChecked}
                onChange={() => onToggle(intent)}
                isDisabled={!intent.is_available}
            />
        </div>
    )

    return (
        <div className={css.intentRow}>
            {isLinkedElsewhere ? (
                <Tooltip
                    placement="bottom"
                    trigger={
                        <div className={css.intentRowTooltipTrigger}>
                            {checkboxField}
                        </div>
                    }
                >
                    <TooltipContent>
                        <div className={css.linkedElsewhereTooltip}>
                            <Text
                                size="sm"
                                className={css.linkedElsewhereTooltipText}
                            >
                                This intent is already linked to another
                                guidance. Unlink it there to assign it here.
                            </Text>
                            <a
                                href={guidanceEditRoute(
                                    intent.used_by_article!.id,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={css.linkedElsewhereTooltipLink}
                            >
                                See guidance
                                <Icon name="external-link" size="sm" />
                            </a>
                        </div>
                    </TooltipContent>
                </Tooltip>
            ) : (
                checkboxField
            )}
            {ticketCount !== undefined && (
                <span
                    className={
                        intent.is_available
                            ? css.intentTicketCount
                            : `${css.intentTicketCount} ${css.intentTicketCountDisabled}`
                    }
                >
                    <Icon
                        name="comm-chat-conversation"
                        size="sm"
                        color={
                            intent.is_available
                                ? 'var(--content-neutral-secondary)'
                                : 'var(--content-neutral-tertiary)'
                        }
                    />
                    <Text size="sm" className={css.intentTicketCountText}>
                        {ticketCount}
                    </Text>
                </span>
            )}
        </div>
    )
}
