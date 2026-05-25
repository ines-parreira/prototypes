import type { ComponentProps, ReactNode } from 'react'

import type { IconName } from '@gorgias/axiom'
import { Box, Icon, Text } from '@gorgias/axiom'

type MessageMetaLabelProps = {
    icon?: IconName
    children: ReactNode
    size?: ComponentProps<typeof Text>['size']
    variant?: 'default' | 'error'
}

export function MessageMetaLabel({
    icon,
    children,
    size = 'sm',
    variant = 'default',
}: MessageMetaLabelProps) {
    const color =
        variant === 'error'
            ? 'content-error-default'
            : 'content-neutral-secondary'

    return (
        <Box alignItems="center" gap="xxs">
            {icon ? <Icon name={icon} size="sm" color={color} /> : null}
            <Text size={size} color={color}>
                {children}
            </Text>
        </Box>
    )
}
