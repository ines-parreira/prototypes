import type { ReactNode } from 'react'

import { Link } from 'react-router-dom'

import { Box, Icon, Text } from '@gorgias/axiom'

type MessageMetaLinkProps = {
    to: string
    children: ReactNode
}

export function MessageMetaLink({ to, children }: MessageMetaLinkProps) {
    return (
        <Link to={to} target="_blank" rel="noopener noreferrer">
            <Box display="inline-flex" alignItems="center" gap="xxxxs">
                <Text size="sm" color="content-accent-default" variant="bold">
                    {children}
                </Text>
                <Icon
                    name="external-link"
                    size="sm"
                    color="content-accent-default"
                />
            </Box>
        </Link>
    )
}
