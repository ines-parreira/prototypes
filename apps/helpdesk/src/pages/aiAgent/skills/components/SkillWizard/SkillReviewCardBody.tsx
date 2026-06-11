import { Fragment } from 'react'

import { Box, Icon, Tag, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import { GuidanceEditor } from 'pages/aiAgent/components/GuidanceEditor/GuidanceEditor'
import { formatIntentName } from 'pages/aiAgent/skills/utils'
import { AppIcon } from 'pages/automate/actionsPlatform/components/AppIcon'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import type { SkillActionGroup } from './skillReviewActions.utils'

import css from './SkillReviewCardBody.less'

type Props = {
    intents: string[]
    actionGroups: SkillActionGroup[]
    instructionsContent: string
    shopName: string
    availableActions: GuidanceAction[]
    onInstructionsChange: (content: string) => void
    onKeepAsDraft: () => void
}

export const SkillReviewCardBody = ({
    intents,
    actionGroups,
    instructionsContent,
    shopName,
    availableActions,
    onInstructionsChange,
    onKeepAsDraft,
}: Props) => (
    <Box flexDirection="column" gap="lg" className={css.body}>
        <Box flexDirection="column" gap="xxxs">
            <Text size="sm">Customer intents this skill handles:</Text>
            {intents.length > 0 && (
                <Box flexDirection="row" gap="xxxs" className={css.intentsRow}>
                    {intents.map((intent) => (
                        <Tag key={intent} size="sm">
                            {formatIntentName(intent)}
                        </Tag>
                    ))}
                </Box>
            )}
        </Box>

        {actionGroups.length > 0 && (
            <Box flexDirection="column" gap="xxxs">
                <Box flexDirection="row" alignItems="center" gap="xxxxs">
                    <Text variant="bold">
                        Actions inserted in this skill&apos;s instructions
                    </Text>
                    <Tooltip
                        delay={0}
                        trigger={
                            <Icon
                                name="info"
                                size="xs"
                                color="var(--content-neutral-secondary)"
                                aria-label="Actions inserted info"
                            />
                        }
                    >
                        <TooltipContent caption="Actions let your AI Agent take steps during a conversation, like sending a link or retrieving order details. These are already inserted in the skill's instructions below in the right places." />
                    </Tooltip>
                </Box>
                <Text size="sm">
                    If you need other apps to perform these actions,{' '}
                    <button
                        type="button"
                        className={css.keepAsDraftLink}
                        onClick={onKeepAsDraft}
                    >
                        keep this skill as a draft for now
                    </button>
                    .
                </Text>
                <Box flexDirection="column" gap="xs" mt="xxxs">
                    {actionGroups.map((group) => (
                        <Box
                            key={group.key}
                            flexDirection="row"
                            gap="xxs"
                            alignItems="center"
                            className={css.actionsRow}
                        >
                            {group.actionNames.map((name, index) => (
                                <Fragment key={`${group.key}-${name}`}>
                                    {index > 0 && (
                                        <Text
                                            size="sm"
                                            color="var(--content-neutral-secondary)"
                                        >
                                            and
                                        </Text>
                                    )}
                                    <Tag>{name}</Tag>
                                </Fragment>
                            ))}
                            <Text
                                size="sm"
                                color="var(--content-neutral-secondary)"
                            >
                                in
                            </Text>
                            <Tag
                                leadingSlot={
                                    group.integration ? (
                                        <AppIcon
                                            icon={group.integration.icon}
                                            name={group.integration.name}
                                            className={css.actionAppIcon}
                                        />
                                    ) : undefined
                                }
                            >
                                {group.integration?.name ?? group.key}
                            </Tag>
                        </Box>
                    ))}
                </Box>
            </Box>
        )}

        <Box flexDirection="column" gap="xxxs">
            <Box flexDirection="row" alignItems="center" gap="xxxxs">
                <Text variant="bold">Instructions</Text>
                <Tooltip
                    delay={0}
                    trigger={
                        <Icon
                            name="info"
                            size="xs"
                            color="var(--content-neutral-secondary)"
                            aria-label="Instructions info"
                        />
                    }
                >
                    <TooltipContent caption="Instructions tell your AI Agent exactly how to handle this type of conversation, step by step. They were generated from your existing guidance and best practices, and can be always be edited later." />
                </Tooltip>
            </Box>
            <GuidanceEditor
                content={instructionsContent}
                shopName={shopName}
                availableActions={availableActions}
                showActionsButton
                handleUpdateContent={onInstructionsChange}
                description=""
                showShortcutHint={false}
                disabledActionsAppearance="neutral"
            />
        </Box>
    </Box>
)
