import { CheckBoxField, Icon, Text } from '@gorgias/axiom'

import type {
    ApiIntent,
    LinkedIntent,
} from '../KnowledgeEditorSidePanelSectionLinkedIntentsModal'

import css from '../KnowledgeEditorSidePanelSectionLinkedIntentsModal.less'

type Props = {
    suggestedIntents: LinkedIntent[]
    draftIntentIds: string[]
    onToggleIntent: (intent: ApiIntent) => void
}

export const SuggestedIntentsSection = ({
    suggestedIntents,
    draftIntentIds,
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
                        <CheckBoxField
                            label={`${intent.groupName}/${intent.name.toLowerCase()}`}
                            value={draftIntentIds.includes(intent.intent)}
                            onChange={() => onToggleIntent(intent)}
                            isDisabled={!intent.is_available}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
