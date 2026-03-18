import { useState } from 'react'

import {
    DisplayedContent,
    FetchingState,
    useCurrentUserLanguagePreferences,
    useRegenerateTicketMessageTranslations,
    useTicketMessageDisplayState,
    useTicketMessageTranslations,
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
} from '@gorgias/axiom'
import { useGetTicket } from '@gorgias/helpdesk-queries'

import { useExpandedMessages } from '../../../contexts/ExpandedMessages'
import { TranslationLimit } from './TranslationLimit'

const IntlDisplayNames = new Intl.DisplayNames(['en'], { type: 'language' })

type TranslationsDropdownProps = {
    messageId: number
    ticketId: number
}

export function TranslationsDropdown({
    messageId,
    ticketId,
}: TranslationsDropdownProps) {
    const { data: ticketData } = useGetTicket(ticketId)
    const ticketLanguage = ticketData?.data?.language
    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()
    const { getMessageTranslation } = useTicketMessageTranslations({
        ticket_id: ticketId,
    })
    const { regenerateTicketMessageTranslations } =
        useRegenerateTicketMessageTranslations()
    const {
        display,
        fetchingState,
        hasRegeneratedOnce,
        setTicketMessageTranslationDisplay,
    } = useTicketMessageDisplayState(messageId)
    const { isMessageExpanded } = useExpandedMessages()

    const hasTranslation = !!getMessageTranslation(messageId)
    const isActive = fetchingState !== FetchingState.Idle || hasTranslation

    const [isTranslationsMenuOpen, setIsTranslationMenuOpen] = useState(false)

    if (
        !shouldShowTranslatedContent(ticketLanguage) ||
        !isActive ||
        isMessageExpanded(messageId)
    ) {
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
                Translating...
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
                    See translation
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
                            {ticketLanguage
                                ? `Translated from ${IntlDisplayNames.of(ticketLanguage)}`
                                : 'Translated'}
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
