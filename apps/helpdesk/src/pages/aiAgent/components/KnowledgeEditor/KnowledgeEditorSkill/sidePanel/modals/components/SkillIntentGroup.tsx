import { Button, Icon, Text } from '@gorgias/axiom'

import type {
    SkillIntentGroupItem,
    SkillIntentItem,
} from '../hooks/useLinkedIntentsModalSkill'
import { SkillIntentRow } from './SkillIntentRow'

import css from '../SkillLinkedIntentsModal.less'

type Props = {
    group: SkillIntentGroupItem
    draftIntentIds: string[]
    isExpanded: boolean
    isSearching: boolean
    intentTicketVolumeById: Record<string, number>
    initialIntentIds?: string[]
    onToggleExpanded: (groupName: string) => void
    onToggleIntent: (intent: SkillIntentItem) => void
}

export const SkillIntentGroup = ({
    group,
    draftIntentIds,
    isExpanded,
    isSearching,
    intentTicketVolumeById,
    initialIntentIds,
    onToggleExpanded,
    onToggleIntent,
}: Props) => {
    const isGroupExpanded = isSearching ? true : isExpanded

    return (
        <div className={css.group}>
            <div className={css.groupHeader}>
                <Text
                    size="sm"
                    color="content-neutral-tertiary"
                    className={css.groupName}
                >
                    {group.name}
                </Text>
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
                        <SkillIntentRow
                            key={`${group.name}-${intent.intent}`}
                            intent={intent}
                            ticketVolume={intentTicketVolumeById[intent.intent]}
                            isChecked={draftIntentIds.includes(intent.intent)}
                            isAlreadyAdded={
                                initialIntentIds?.includes(intent.intent) ??
                                false
                            }
                            onToggle={onToggleIntent}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
