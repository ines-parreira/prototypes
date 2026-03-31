import classNames from 'classnames'

import { Box, Icon, Tag, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'

import type { TransformedArticle } from '../../types'

import css from './LinkToSkillRow.less'

interface LinkToSkillRowProps {
    article: TransformedArticle
    isSelected: boolean
    onToggle: (articleId: number) => void
}

const VISIBLE_INTENTS_COUNT = 2

export const LinkToSkillRow = ({
    article,
    isSelected,
    onToggle,
}: LinkToSkillRowProps) => {
    const ticketCount = article.metrics?.tickets
    const visibleIntents = article.intents.slice(0, VISIBLE_INTENTS_COUNT)
    const remainingIntents = article.intents.slice(VISIBLE_INTENTS_COUNT)

    return (
        <div
            className={classNames(css.skillRow, {
                [css.skillRowSelected]: isSelected,
            })}
            role="option"
            aria-selected={isSelected}
            tabIndex={0}
            onClick={() => onToggle(article.id)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onToggle(article.id)
                }
            }}
        >
            <Icon name="article"></Icon>
            <Box flexDirection="column" gap="xxs" flexGrow={1} minWidth={0}>
                <TruncatedTextWithTooltip tooltipContent={article.title}>
                    <Text size="md">{article.title}</Text>
                </TruncatedTextWithTooltip>
                {article.intents.length > 0 && (
                    <Box
                        flexDirection="row"
                        alignItems="center"
                        flexWrap="wrap"
                        gap="xxxs"
                    >
                        {visibleIntents.map((intent) => (
                            <Tag key={intent.name} size="sm">
                                {intent.formattedName}
                            </Tag>
                        ))}
                        {remainingIntents.length > 0 && (
                            <Tooltip
                                trigger={
                                    <div className={css.additionalIntentsCount}>
                                        <Text size="sm" variant="bold">
                                            +{remainingIntents.length}
                                        </Text>
                                    </div>
                                }
                            >
                                <TooltipContent>
                                    <Box flexDirection="column">
                                        {remainingIntents.map((intent) => (
                                            <Text key={intent.name} size="sm">
                                                {intent.formattedName}
                                            </Text>
                                        ))}
                                    </Box>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </Box>
                )}
            </Box>

            {isSelected ? (
                <Icon
                    name="check"
                    size="sm"
                    color="var(--content-accent-default)"
                />
            ) : (
                ticketCount !== null &&
                ticketCount !== undefined && (
                    <Box gap="xxxs">
                        <Icon
                            name="comm-chat"
                            size="sm"
                            color="var(--content-neutral-secondary)"
                        />
                        <Text
                            size="sm"
                            variant="bold"
                            color="content-neutral-secondary"
                        >
                            {ticketCount}
                        </Text>
                    </Box>
                )
            )}
        </div>
    )
}
