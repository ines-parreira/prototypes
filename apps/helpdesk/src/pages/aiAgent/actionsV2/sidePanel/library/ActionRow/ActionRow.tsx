import { Box, Button, Heading, Icon, Text } from '@gorgias/axiom'

import { HighlightedText } from '../../shared/HighlightedText'
import { ProviderIcon } from '../../shared/ProviderIcon'

import css from './ActionRow.less'

type Props = {
    iconUrl: string
    iconAlt?: string
    name: string
    provider: string
    onInsert?: () => void
    onEdit?: () => void
    isDraggable?: boolean
    searchQuery?: string
}

export const ActionRow = ({
    iconUrl,
    iconAlt,
    name,
    provider,
    onInsert,
    onEdit,
    isDraggable = true,
    searchQuery,
}: Props) => {
    const isInteractive = Boolean(onInsert)

    return (
        <div
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            onClick={onInsert}
            onKeyDown={
                isInteractive
                    ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              onInsert?.()
                          }
                      }
                    : undefined
            }
            draggable={isDraggable || undefined}
            className={css.row}
            aria-label={`Insert ${name} action`}
        >
            {isDraggable && (
                <span
                    className={css.dragHandle}
                    aria-hidden="true"
                    role="presentation"
                >
                    <Icon name="grip" />
                </span>
            )}
            <ProviderIcon iconUrl={iconUrl} alt={iconAlt} />
            <Box flexDirection="column" gap="xxxs" flexGrow={1}>
                <Heading size="sm">
                    <HighlightedText text={name} query={searchQuery ?? ''} />
                </Heading>
                <Text size="sm" color="content-neutral-secondary">
                    {provider}
                </Text>
            </Box>
            {onEdit && (
                <Button
                    as="button"
                    variant="tertiary"
                    size="sm"
                    intent="regular"
                    icon="note-edit"
                    onClick={(event) => {
                        event.stopPropagation()
                        onEdit()
                    }}
                    aria-label={`Edit ${name}`}
                />
            )}
        </div>
    )
}
