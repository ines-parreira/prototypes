import type { ReactNode } from 'react'

import { Box, Card, Dot, Heading, Tag, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import { formatIntentName } from 'pages/aiAgent/skills/utils'
import type { GuidanceArticle } from 'pages/aiAgent/types'
import { RelativeTime } from 'pages/common/components/RelativeTime'

import { ArticleTypeBadge } from './ArticleTypeBadge'
import { getStatusTag } from './status'

import css from './ArticleReferenceCard.less'

const MAX_VISIBLE_INTENTS = 3

type Props = {
    article: GuidanceArticle
    icon: IconName
    typeLabel: string
    /**
     * Optional rendered content preview (Guidance only) — a mix of plain text
     * and inline action/variable pills produced by `renderGuidanceContent`.
     */
    body?: ReactNode
}

/**
 * Shared reference card for the two `GuidanceArticle`-backed reference types
 * (Skill, Guidance). They differ only by their type badge icon/label and
 * whether they show a content body preview.
 */
export function ArticleReferenceCard({
    article,
    icon,
    typeLabel,
    body,
}: Props) {
    const status = getStatusTag(article)
    const intents = article.intents ?? []
    const visibleIntents = intents.slice(0, MAX_VISIBLE_INTENTS)
    const overflowCount = intents.length - visibleIntents.length

    return (
        <Card
            flexDirection="column"
            gap="md"
            elevation="mid"
            p="md"
            width="100%"
        >
            <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                gap="xs"
            >
                <ArticleTypeBadge icon={icon} label={typeLabel} />
                <Tag
                    leadingSlot={
                        status.dotColor ? (
                            <Dot color={status.dotColor} size="sm" />
                        ) : undefined
                    }
                >
                    {status.label}
                </Tag>
            </Box>

            <Heading size="md">{article.title}</Heading>

            {body ? (
                <Text
                    size="sm"
                    color="content-neutral-secondary"
                    className={css.bodyClamp}
                >
                    {body}
                </Text>
            ) : null}

            {intents.length > 0 ? (
                <Box flexDirection="column" gap="xs">
                    <Text
                        size="sm"
                        variant="medium"
                        color="content-neutral-secondary"
                    >
                        Intents
                    </Text>
                    <Box flexDirection="row" flexWrap="wrap" gap="xxxs">
                        {visibleIntents.map((intent) => (
                            <Tag key={intent} size="sm">
                                {formatIntentName(intent)}
                            </Tag>
                        ))}
                        {overflowCount > 0 ? (
                            <Tag size="sm">+{overflowCount} more</Tag>
                        ) : null}
                    </Box>
                </Box>
            ) : null}

            <Text size="sm" color="content-neutral-secondary">
                Updated <RelativeTime datetime={article.lastUpdated} />
            </Text>
        </Card>
    )
}
