import classNames from 'classnames'

import { Dot, Icon, Tag, Text } from '@gorgias/axiom'

import { INTENT_DESCRIPTIONS } from 'pages/aiAgent/skills/components/IntentsTable/intentDescriptions'
import { HANDOVER_ONLY_INTENTS } from 'pages/aiAgent/skills/hooks/useIntentsTable'
import { formatIntentName } from 'pages/aiAgent/skills/utils'

import type { SkillIntentItem } from '../hooks/useLinkedIntentsModalSkill'

import css from '../SkillLinkedIntentsModal.less'

type Props = {
    intent: SkillIntentItem
    ticketVolume?: number
    isChecked: boolean
    isAlreadyAdded?: boolean
    onToggle: (intent: SkillIntentItem) => void
}

export const SkillIntentRow = ({
    intent,
    ticketVolume,
    isChecked,
    isAlreadyAdded = false,
    onToggle,
}: Props) => {
    const isHandoverOnly = HANDOVER_ONLY_INTENTS.includes(intent.intent)
    const isPendingReassignment =
        !isHandoverOnly && isAlreadyAdded && !!intent.used_by_article
    const isLinkedToAnotherSkill =
        !isHandoverOnly && !isAlreadyAdded && !!intent.used_by_article
    const description = INTENT_DESCRIPTIONS[intent.intent]
    const isNewlySelected = isChecked && !isAlreadyAdded
    const isClickable = !isHandoverOnly && !isAlreadyAdded

    return (
        <div
            className={classNames(css.intentRow, {
                [css.intentRowClickable]: isClickable,
                [css.intentRowSelected]: isNewlySelected,
            })}
            onClick={isClickable ? () => onToggle(intent) : undefined}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={
                isClickable
                    ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onToggle(intent)
                          }
                      }
                    : undefined
            }
        >
            <div className={css.intentLabel}>
                <Text
                    size="md"
                    color={
                        isNewlySelected ? 'content-accent-default' : undefined
                    }
                >
                    {formatIntentName(intent.intent)}
                </Text>
                {description && (
                    <Text
                        size="sm"
                        color={
                            isNewlySelected
                                ? 'content-accent-default'
                                : 'content-neutral-tertiary'
                        }
                        className={css.intentDescription}
                    >
                        {description}
                    </Text>
                )}
            </div>
            <div className={css.intentTrailing}>
                {isPendingReassignment && (
                    <Tag
                        size="sm"
                        leadingSlot={<Dot color="orange" size="sm" />}
                    >
                        Pending reassignment
                    </Tag>
                )}
                {isAlreadyAdded && !isPendingReassignment && (
                    <Tag color="grey" size="sm">
                        Already added
                    </Tag>
                )}
                {isLinkedToAnotherSkill && (
                    <Tag color="purple" size="sm">
                        Linked to another skill
                    </Tag>
                )}
                <span className={css.intentTicketCount}>
                    <Icon
                        name="chat"
                        size="sm"
                        color={
                            isHandoverOnly
                                ? 'var(--content-neutral-tertiary)'
                                : 'var(--content-neutral-secondary)'
                        }
                    />
                    <Text
                        size="sm"
                        variant="bold"
                        className={css.intentTicketCountText}
                    >
                        {ticketVolume ?? 0}
                    </Text>
                </span>
            </div>
        </div>
    )
}
