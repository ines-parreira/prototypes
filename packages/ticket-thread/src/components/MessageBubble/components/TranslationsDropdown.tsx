import { useState } from 'react'

import {
    DisplayedContent,
    FetchingState,
    useRegenerateTicketMessageTranslations,
} from '@repo/tickets'

import {
    Box,
    Button,
    DropdownIcon,
    IconName,
    Loader,
    Menu,
    MenuItem,
    MenuSection,
    Text,
} from '@gorgias/axiom'

import { TranslationLimit } from './TranslationLimit'
import { useMessageTranslations } from './useMessageTranslations'

const IntlDisplayNames = new Intl.DisplayNames(['en'], { type: 'language' })

type TranslationsDropdownProps = {
    messageId: number
    ticketId: number
}

export function TranslationsDropdown({
    messageId,
    ticketId,
}: TranslationsDropdownProps) {
    const { regenerateTicketMessageTranslations } =
        useRegenerateTicketMessageTranslations()
    const {
        shouldRender,
        ticketLanguage,
        display,
        fetchingState,
        hasRegeneratedOnce,
        setTicketMessageTranslationDisplay,
    } = useMessageTranslations({
        messageId,
        ticketId,
    })
    const [isTranslationsMenuOpen, setIsTranslationMenuOpen] = useState(false)

    if (!shouldRender) {
        return null
    }

    if (fetchingState === FetchingState.Loading) {
        return (
            <Button
                leadingSlot={<Loader size="sm" />}
                variant="tertiary"
                size="sm"
                isDisabled
            >
                <Text size="sm" color="content-neutral-secondary">
                    Translating...
                </Text>
            </Button>
        )
    }

    return (
        <Box alignItems="center" gap="xxxs">
            {display === DisplayedContent.Original ? (
                <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() =>
                        setTicketMessageTranslationDisplay([
                            {
                                messageId,
                                fetchingState,
                                hasRegeneratedOnce,
                                display: DisplayedContent.Translated,
                            },
                        ])
                    }
                >
                    <Text size="sm" color="content-neutral-secondary">
                        See translation
                    </Text>
                </Button>
            ) : (
                <Menu
                    aria-label="Translation options"
                    placement="bottom left"
                    onOpenChange={(isOpen) => setIsTranslationMenuOpen(isOpen)}
                    trigger={
                        <Button
                            variant="tertiary"
                            size="sm"
                            trailingSlot={
                                <DropdownIcon isOpen={isTranslationsMenuOpen} />
                            }
                        >
                            <Text size="sm" color="content-neutral-secondary">
                                {ticketLanguage
                                    ? `Translated from ${IntlDisplayNames.of(ticketLanguage)}`
                                    : 'Translated'}
                            </Text>
                        </Button>
                    }
                >
                    <MenuSection id="translation-actions">
                        <MenuItem
                            id="show-original"
                            label="Show original"
                            leadingSlot={IconName.ArrowUndoUpLeft}
                            onAction={() =>
                                setTicketMessageTranslationDisplay([
                                    {
                                        messageId,
                                        fetchingState,
                                        hasRegeneratedOnce,
                                        display: DisplayedContent.Original,
                                    },
                                ])
                            }
                        />
                        <MenuItem
                            id="regenerate-translation"
                            label="Regenerate translation"
                            leadingSlot={IconName.ArrowsReloadAlt1}
                            isDisabled={hasRegeneratedOnce}
                            onAction={() =>
                                regenerateTicketMessageTranslations(messageId)
                            }
                        />
                    </MenuSection>
                </Menu>
            )}
            {fetchingState === FetchingState.Failed && hasRegeneratedOnce && (
                <TranslationLimit />
            )}
        </Box>
    )
}
