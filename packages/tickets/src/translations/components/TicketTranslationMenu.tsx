import { useCallback } from 'react'

import { useHistory } from 'react-router-dom'

import {
    Button,
    Icon,
    Menu,
    MenuItem,
    MenuSection,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { Ticket } from '@gorgias/helpdesk-types'

import { useTicketTranslationHelper } from '../hooks/useTicketTranslationHelper'
import { useTicketTranslationMenuDisplay } from '../hooks/useTicketTranslationMenuDisplay'
import { DisplayedContent } from '../store/constants'
import { useTicketMessageTranslationDisplay } from '../store/useTicketMessageTranslationDisplay'

type TicketTranslationMenuProps = {
    ticket: Ticket
}

export function TicketTranslationMenu({ ticket }: TicketTranslationMenuProps) {
    const history = useHistory()
    const {
        setAllTicketMessagesToOriginal,
        setAllTicketMessagesToTranslated,
        allMessageDisplayState,
    } = useTicketMessageTranslationDisplay()

    const shouldShowTranslationMenu = useTicketTranslationMenuDisplay(ticket)
    const helper = useTicketTranslationHelper(ticket.language)
    const isTranslated = allMessageDisplayState === DisplayedContent.Translated

    const handleTranslationSettingsClick = useCallback(() => {
        history.push('/app/settings/profile#translation-settings')
    }, [history])

    if (!shouldShowTranslationMenu) return null

    return (
        <Tooltip placement="bottom">
            <Menu
                aria-label="Translation menu"
                placement="bottom right"
                trigger={
                    <Button
                        size="sm"
                        variant="secondary"
                        icon="translate"
                        aria-label={helper}
                    />
                }
            >
                <MenuSection id="ticket-translations" name={helper}>
                    {isTranslated && (
                        <MenuItem
                            id="show-original"
                            label="Show original"
                            leadingSlot={<Icon name="arrow-undo-up-left" />}
                            onAction={setAllTicketMessagesToOriginal}
                        />
                    )}
                    {!isTranslated && (
                        <MenuItem
                            id="show-translation"
                            label="See translation"
                            leadingSlot={<Icon name="translate" />}
                            onAction={setAllTicketMessagesToTranslated}
                        />
                    )}
                    <MenuItem
                        label="Translation settings"
                        leadingSlot={<Icon name="settings" />}
                        onAction={handleTranslationSettingsClick}
                    />
                </MenuSection>
            </Menu>
            <TooltipContent title={helper} />
        </Tooltip>
    )
}
