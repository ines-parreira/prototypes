import type { ReactNode } from 'react'

import type { IconName } from '@gorgias/axiom'
import { Box, Icon, Text } from '@gorgias/axiom'

type MessageMetaLabelProps = {
    icon: IconName
    children: ReactNode
    variant?: 'default' | 'error'
}

export function MessageMetaLabel({
    icon,
    children,
    variant = 'default',
}: MessageMetaLabelProps) {
    const color =
        variant === 'error'
            ? 'content-error-default'
            : 'content-neutral-secondary'

    return (
        <Box alignItems="center" gap="xxs">
            <Icon name={icon} size="sm" color={color} />
            <Text size="sm" color={color}>
                {children}
            </Text>
        </Box>
    )
}
