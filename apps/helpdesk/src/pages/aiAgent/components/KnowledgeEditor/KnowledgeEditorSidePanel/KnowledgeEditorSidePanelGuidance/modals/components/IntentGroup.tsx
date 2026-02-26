import { Button, CheckBoxField, Icon } from '@gorgias/axiom'

import type {
    ApiIntent,
    LinkedIntentGroup,
} from '../KnowledgeEditorSidePanelSectionLinkedIntentsModal'
import { IntentRow } from './IntentRow'

import css from '../KnowledgeEditorSidePanelSectionLinkedIntentsModal.less'

type Props = {
    group: LinkedIntentGroup
    draftIntentIds: string[]
    isExpanded: boolean
    isSearching: boolean
    onToggleGroup: (group: LinkedIntentGroup) => void
    onToggleExpanded: (groupName: string) => void
    onToggleIntent: (intent: ApiIntent) => void
    guidanceEditRoute: (articleId: number) => string
}

export const IntentGroup = ({
    group,
    draftIntentIds,
    isExpanded,
    isSearching,
    onToggleGroup,
    onToggleExpanded,
    onToggleIntent,
    guidanceEditRoute,
}: Props) => {
    const availableIntentIds = group.children
        .filter((intent) => intent.is_available)
        .map((intent) => intent.intent)

    const selectedCount = availableIntentIds.filter((id) =>
        draftIntentIds.includes(id),
    ).length

    const isGroupExpanded = isSearching ? true : isExpanded

    return (
        <div className={css.group}>
            <div className={css.groupHeader}>
                <CheckBoxField
                    label={group.name}
                    value={
                        availableIntentIds.length > 0 &&
                        selectedCount === availableIntentIds.length
                    }
                    isIndeterminate={
                        selectedCount > 0 &&
                        selectedCount < availableIntentIds.length
                    }
                    onChange={() => onToggleGroup(group)}
                    isDisabled={availableIntentIds.length === 0}
                />
                {!isSearching && (
                    <Button
                        size="sm"
                        variant="tertiary"
                        onClick={() => onToggleExpanded(group.name)}
                        aria-label={`Toggle ${group.name} intents`}
                    >
                        <Icon
                            name={
                                isGroupExpanded
                                    ? 'arrow-chevron-up'
                                    : 'arrow-chevron-down'
                            }
                        />
                    </Button>
                )}
            </div>

            {isGroupExpanded && (
                <div className={css.groupItems}>
                    {group.children.map((intent) => (
                        <IntentRow
                            key={`${group.name}-${intent.intent}`}
                            intent={intent}
                            groupName={group.name}
                            isChecked={draftIntentIds.includes(intent.intent)}
                            onToggle={onToggleIntent}
                            guidanceEditRoute={guidanceEditRoute}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
