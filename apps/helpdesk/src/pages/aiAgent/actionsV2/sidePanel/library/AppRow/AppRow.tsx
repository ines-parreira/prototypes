import { Box, Button, Heading, Text } from '@gorgias/axiom'

import { HighlightedText } from '../../shared/HighlightedText'
import { ProviderIcon } from '../../shared/ProviderIcon'
import { StatusBadge } from '../../shared/StatusBadge'

import css from './AppRow.less'

type Props = {
    iconUrl: string
    iconAlt?: string
    name: string
    actionCount: number
    status: 'configured' | 'connect'
    onClick?: () => void
    onConnect?: () => void
    searchQuery?: string
}

export const AppRow = ({
    iconUrl,
    iconAlt,
    name,
    actionCount,
    status,
    onClick,
    onConnect,
    searchQuery,
}: Props) => {
    const trailingAction = (() => {
        if (status === 'configured') {
            return <StatusBadge status="configured" />
        }
        if (status === 'connect' && onConnect) {
            return (
                <Button
                    as="button"
                    variant="secondary"
                    size="sm"
                    intent="regular"
                    onClick={(event) => {
                        event.stopPropagation()
                        onConnect()
                    }}
                >
                    Connect
                </Button>
            )
        }
        return null
    })()

    const isInteractive = Boolean(onClick)

    return (
        <div
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            onClick={onClick}
            onKeyDown={
                isInteractive
                    ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              onClick?.()
                          }
                      }
                    : undefined
            }
            className={css.row}
        >
            <ProviderIcon iconUrl={iconUrl} alt={iconAlt} />
            <Box flexDirection="column" gap="xxxs" flexGrow={1}>
                <Heading size="sm">
                    <HighlightedText text={name} query={searchQuery ?? ''} />
                </Heading>
                <Text size="sm" color="content-neutral-secondary">
                    {actionCount} {actionCount === 1 ? 'action' : 'actions'}
                </Text>
            </Box>
            {trailingAction}
        </div>
    )
}
