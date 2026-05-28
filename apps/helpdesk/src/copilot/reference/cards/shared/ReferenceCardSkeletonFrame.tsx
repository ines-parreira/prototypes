import type { ReactNode } from 'react'

import { Box, Card, Icon, Text } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './ReferenceCardShell.less'

type Props = {
    icon: IconName
    typeLabel: string
    /** Right-side eyebrow content (e.g. `#1234` placeholder for tickets). */
    eyebrow?: ReactNode
    children: ReactNode
}

/**
 * Outer card + eyebrow row shared by every per-card skeleton. Mirrors the
 * frame produced by `ReferenceCardShell` so the skeleton and the loaded card
 * occupy identical outer geometry — keeping the icon, type label, padding and
 * gaps in one place avoids drift between the two.
 */
export function ReferenceCardSkeletonFrame({
    icon,
    typeLabel,
    eyebrow,
    children,
}: Props) {
    return (
        <Card
            flexDirection="column"
            gap="xxs"
            elevation="mid"
            p="md"
            width="100%"
        >
            <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                gap="xxs"
            >
                <Box flexDirection="row" alignItems="center" gap="xxs">
                    <Icon
                        name={icon}
                        size="xs"
                        color="content-neutral-secondary"
                    />
                    <Text
                        size="xs"
                        variant="medium"
                        color="content-neutral-secondary"
                        className={css.typeLabel}
                    >
                        {typeLabel}
                    </Text>
                </Box>
                {eyebrow}
            </Box>
            {children}
        </Card>
    )
}
