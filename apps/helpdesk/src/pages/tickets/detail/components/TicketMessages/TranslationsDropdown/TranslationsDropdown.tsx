import type { ComponentProps } from 'react'
import { useState } from 'react'

import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap'

import { IntlDisplayNames } from 'constants/languages'
import useAppSelector from 'hooks/useAppSelector'
import { getTicket } from 'state/ticket/selectors'
import { useRegenerateTicketMessageTranslations } from 'tickets/core/hooks/translations/useRegenerateTicketMessageTranslations'
import {
    DisplayedContent,
    FetchingState,
} from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'
import { useTicketMessageTranslationDisplay } from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/useTicketMessageTranslationDisplay'

import { TranslationLimit } from '../TranslationLimit'
import { TranslationLoader } from '../TranslationLoader'

import css from './TranslationsDropdown.less'

type TranslationsDropdownProps = {
    messageId: number
}

export function TranslationsDropdown({ messageId }: TranslationsDropdownProps) {
    const ticket = useAppSelector(getTicket)
    const [isTranslationsDropdownOpen, setTranslationsDropdownOpen] =
        useState(false)
    const { regenerateTicketMessageTranslations } =
        useRegenerateTicketMessageTranslations()
    const {
        getTicketMessageTranslationDisplay,
        setTicketMessageTranslationDisplay,
    } = useTicketMessageTranslationDisplay()
    const { display, fetchingState, hasRegeneratedOnce } =
        getTicketMessageTranslationDisplay(messageId)

    async function handleRegenerateTranslation() {
        await regenerateTicketMessageTranslations(messageId)
        setTranslationsDropdownOpen(false)
    }

    return (
        <div className={css.wrapper}>
            {fetchingState === FetchingState.Loading ? (
                <TranslationLoader />
            ) : (
                <>
                    {display === DisplayedContent.Original ? (
                        <button
                            className={css.dropdownToggle}
                            onClick={() => {
                                setTicketMessageTranslationDisplay([
                                    {
                                        messageId,
                                        fetchingState,
                                        hasRegeneratedOnce,
                                        display: DisplayedContent.Translated,
                                    },
                                ])
                                setTranslationsDropdownOpen(false)
                            }}
                        >
                            See translation
                        </button>
                    ) : (
                        <Dropdown
                            isOpen={isTranslationsDropdownOpen}
                            toggle={() =>
                                setTranslationsDropdownOpen((isOpen) => !isOpen)
                            }
                            className={css.dropdown}
                        >
                            <DropdownToggle className={css.dropdownToggle}>
                                {ticket?.language && (
                                    <>
                                        Translated from{' '}
                                        {IntlDisplayNames.of(ticket.language)}
                                        <i
                                            className="material-icons"
                                            aria-label="Translate message"
                                        >
                                            arrow_drop_down
                                        </i>
                                    </>
                                )}
                            </DropdownToggle>

                            <DropdownMenu right className={css.menuWrapper}>
                                <ul className={css.translationsList}>
                                    {display ===
                                        DisplayedContent.Translated && (
                                        <TranslationsItem
                                            onClick={() =>
                                                setTicketMessageTranslationDisplay(
                                                    [
                                                        {
                                                            messageId,
                                                            fetchingState,
                                                            hasRegeneratedOnce,
                                                            display:
                                                                DisplayedContent.Original,
                                                        },
                                                    ],
                                                )
                                            }
                                        >
                                            <span className={css.icon}>
                                                <i className="material-icons">
                                                    undo
                                                </i>
                                            </span>
                                            <span className={css.label}>
                                                Show original
                                            </span>
                                        </TranslationsItem>
                                    )}
                                    <TranslationsItem
                                        disabled={hasRegeneratedOnce}
                                        onClick={handleRegenerateTranslation}
                                    >
                                        <span className={css.icon}>
                                            <i className="material-icons">
                                                loop
                                            </i>
                                        </span>
                                        <span className={css.label}>
                                            Re-generate translation
                                        </span>
                                    </TranslationsItem>
                                </ul>
                            </DropdownMenu>
                        </Dropdown>
                    )}
                </>
            )}

            {fetchingState === FetchingState.Failed && hasRegeneratedOnce && (
                <TranslationLimit />
            )}
        </div>
    )
}

function TranslationsItem({ children, ...props }: ComponentProps<'button'>) {
    return (
        <li className={css.translationsListItem}>
            <button {...props} className={css.translationsItem}>
                <div className={css.translationsItemContent}>{children}</div>
            </button>
        </li>
    )
}
