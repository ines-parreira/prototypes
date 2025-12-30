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
import type { Language } from '@gorgias/helpdesk-types'

import { DisplayedContent } from '../store/constants'
import { useTicketMessageTranslationDisplay } from '../store/useTicketMessageTranslationDisplay'
import { useTicketTranslationHelper } from './useTicketTranslationHelper'

type TicketTranslationMenuProps = {
    language: Language
}

export function TicketTranslationMenu({
    language,
}: TicketTranslationMenuProps) {
    const history = useHistory()
    const {
        setAllTicketMessagesToOriginal,
        setAllTicketMessagesToTranslated,
        allMessageDisplayState,
    } = useTicketMessageTranslationDisplay()

    const helper = useTicketTranslationHelper(language)
    const isTranslated = allMessageDisplayState === DisplayedContent.Translated

    const handleTranslationSettingsClick = useCallback(() => {
        history.push('/app/settings/profile#translation-settings')
    }, [history])

    return (
        <Tooltip>
            <Menu
                aria-label="Ticket translations menu"
                placement="bottom right"
                trigger={
                    <Button
                        slot="button"
                        size="sm"
                        variant="secondary"
                        icon="translate"
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
