import { CheckBoxField, Icon, Text } from '@gorgias/axiom'

import { formatIntentLabel } from '../../utils/formatIntentLabel'
import type {
    ApiIntent,
    LinkedIntent,
} from '../KnowledgeEditorSidePanelSectionLinkedIntentsModal'

import css from '../KnowledgeEditorSidePanelSectionLinkedIntentsModal.less'

type Props = {
    suggestedIntents: LinkedIntent[]
    draftIntentIds: string[]
    intentTicketCountById: Record<string, number>
    onToggleIntent: (intent: ApiIntent) => void
}

export const SuggestedIntentsSection = ({
    suggestedIntents,
    draftIntentIds,
    intentTicketCountById,
    onToggleIntent,
}: Props) => {
    if (suggestedIntents.length === 0) {
        return null
    }

    return (
        <div className={css.suggestedSection}>
            <div className={css.suggestedHeader}>
                <Icon name="light-bulb" />
                <Text size="sm" className={css.suggestedTitle}>
                    Suggested
                </Text>
            </div>
            <div className={css.suggestedList}>
                {suggestedIntents.map((intent) => (
                    <div
                        className={css.intentRow}
                        key={`suggested-${intent.intent}`}
                    >
                        <div className={css.intentCheckbox}>
                            <CheckBoxField
                                label={formatIntentLabel(intent.intent)}
                                value={draftIntentIds.includes(intent.intent)}
                                onChange={() => onToggleIntent(intent)}
                                isDisabled={!intent.is_available}
                            />
                        </div>
                        {intentTicketCountById[intent.intent] !== undefined && (
                            <span className={css.intentTicketCount}>
                                <Icon
                                    name="comm-chat-conversation"
                                    size="sm"
                                    color="var(--content-neutral-secondary)"
                                />
                                <Text
                                    size="sm"
                                    className={css.intentTicketCountText}
                                >
                                    {intentTicketCountById[intent.intent]}
                                </Text>
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
