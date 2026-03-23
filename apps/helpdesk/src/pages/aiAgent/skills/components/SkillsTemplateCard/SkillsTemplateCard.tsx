import classNames from 'classnames'

import {
    Box,
    Button,
    ProgressBar,
    Tag,
    TagColor,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { IntentStatus } from 'pages/aiAgent/skills/types'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'
import { formatIntentName } from 'pages/aiAgent/skills/utils'

import css from './SkillsTemplateCard.less'

const MAX_VISIBLE_INTENTS = 2

type Props = {
    skillTemplate: SkillTemplate
    onCreateSkillsFromTemplate: () => void
    className?: string
    hasStats?: boolean
    hasCTA?: boolean
    hasActiveCTA?: boolean
}

export const SkillsTemplateCard: React.FC<Props> = ({
    skillTemplate,
    onCreateSkillsFromTemplate,
    className,
    hasStats = false,
    hasCTA = false,
    hasActiveCTA = false,
}) => {
    const displayedIntents = skillTemplate.intents.slice(0, MAX_VISIBLE_INTENTS)
    const remainingCount = skillTemplate.intents.length - MAX_VISIBLE_INTENTS
    const hiddenIntents = skillTemplate.intents.slice(MAX_VISIBLE_INTENTS)

    const value = 19
    const maxValue = 100

    return (
        <Box
            className={classNames(css.card, className)}
            onClick={!hasCTA ? onCreateSkillsFromTemplate : undefined}
        >
            <Box
                display="flex"
                flexDirection="column"
                gap={hasStats ? 'xs' : 'sm'}
            >
                <Text variant="bold" size="md">
                    {skillTemplate.name}
                </Text>
                <Box className={css.tagsContainer}>
                    {displayedIntents.map((intent) => (
                        <Tag
                            key={intent.name}
                            color={
                                intent.status === IntentStatus.Linked
                                    ? TagColor.Grey
                                    : undefined
                            }
                        >
                            {formatIntentName(intent.name)}
                        </Tag>
                    ))}
                    {remainingCount > 0 && (
                        <Tooltip
                            trigger={
                                <div className={css.remainingCount}>
                                    <Text variant="bold" size="sm">
                                        +{remainingCount}
                                    </Text>
                                </div>
                            }
                        >
                            <TooltipContent>
                                {hiddenIntents.map((intent) => (
                                    <Text key={intent.name} size="sm">
                                        {formatIntentName(intent.name)}
                                    </Text>
                                ))}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </Box>
            </Box>
            {!!hasStats && (
                // Actual stats data will be inserted in the next iteration
                <Box gap="xl">
                    <Box flexDirection="column" gap="xxxs">
                        <Text size="xs" className={css.statsTitle}>
                            Ticket volume
                        </Text>
                        <Text size="sm" variant="bold">
                            1,090 (50%)
                        </Text>
                    </Box>
                    <Box flexDirection="column" gap="xxxs">
                        <Text size="xs" className={css.statsTitle}>
                            Handover
                        </Text>
                        <Box gap="xxs" width="100%" alignItems="center">
                            <Text size="sm" variant="bold">
                                289 (19%)
                            </Text>
                            <Box alignItems="center">
                                <ProgressBar
                                    value={value}
                                    maxValue={maxValue}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            )}
            {!!hasCTA && (
                <Box>
                    <Button
                        size="sm"
                        onClick={onCreateSkillsFromTemplate}
                        variant={hasActiveCTA ? 'primary' : 'secondary'}
                    >
                        Set up skill
                    </Button>
                </Box>
            )}
        </Box>
    )
}
