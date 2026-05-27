import { Box, Card, Icon, Skeleton, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './ReferenceCardShell.less'

type Props = {
    icon: IconName
    typeLabel: string
    /**
     * Whether to render the body region. Skill cards don't show a body, so we
     * skip the two body placeholder lines for them.
     */
    withBody?: boolean
    /**
     * Number of footer metadata rows to render. Skill cards have two
     * ("N linked intents", "Updated X ago"); guidance defaults to one
     * ("Updated X ago", intents row only renders when > 0).
     */
    footerRows?: 1 | 2
}

/**
 * Mirrors the structure of `ReferenceCardShell` so the popover doesn't visibly
 * jump between the loading and loaded states:
 *   - eyebrow row (real icon + type label)
 *   - title placeholder (two lines, matching the 2-line clamped title)
 *   - body placeholder (optional, two lines)
 *   - footer rows (real clock icon + short placeholder, with the same border-top)
 */
export function ReferenceCardSkeleton({
    icon,
    typeLabel,
    withBody = true,
    footerRows = 1,
}: Props) {
    return (
        <Card
            flexDirection="column"
            gap="xxs"
            elevation="mid"
            p="md"
            width="100%"
        >
            <Box flexDirection="row" alignItems="center" gap="xxs">
                <Icon name={icon} size="xs" color="content-neutral-secondary" />
                <Text
                    size="xs"
                    variant="medium"
                    color="content-neutral-secondary"
                    className={css.typeLabel}
                >
                    {typeLabel}
                </Text>
            </Box>

            <Box
                flexDirection="column"
                gap="xxs"
                className={css.titleRow}
                width="100%"
            >
                <Skeleton height={14} />
                <Skeleton height={14} width="60%" />
            </Box>

            {withBody ? (
                <Box flexDirection="column" gap="xxxs" width="100%">
                    <Skeleton height={10} />
                    <Skeleton height={10} width="80%" />
                </Box>
            ) : null}

            <Box
                flexDirection="column"
                gap="xxs"
                className={css.rows}
                width="100%"
            >
                <Box flexDirection="row" alignItems="center" gap="xxs">
                    <Icon
                        name="clock"
                        size="xs"
                        color="content-neutral-secondary"
                    />
                    <Skeleton height={10} width={120} />
                </Box>
                {footerRows >= 2 ? (
                    <Box flexDirection="row" alignItems="center" gap="xxs">
                        <Icon
                            name="chat"
                            size="xs"
                            color="content-neutral-secondary"
                        />
                        <Skeleton height={10} width={100} />
                    </Box>
                ) : null}
            </Box>
        </Card>
    )
}
