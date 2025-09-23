import { ComponentProps, useState } from 'react'

import { useId } from '@repo/hooks'
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap'

import { Tooltip } from '@gorgias/axiom'

import { useRegenerateTicketMessageTranslations } from 'tickets/core/hooks/translations/useRegenerateTicketMessageTranslations'
import { DisplayedContent } from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'
import { useTicketMessageTranslationDisplay } from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/useTicketMessageTranslationDisplay'

import css from './TranslationsDropdown.less'

type TranslationsDropdownProps = {
    messageId: number
}

export function TranslationsDropdown({ messageId }: TranslationsDropdownProps) {
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

    const id = useId()
    const scopedId = `translations-dropdown-${id}`

    async function handleRegenerateTranslation() {
        await regenerateTicketMessageTranslations(messageId)
        setTranslationsDropdownOpen(false)
    }

    return (
        <>
            <Dropdown
                placement="bottom-end"
                isOpen={isTranslationsDropdownOpen}
                toggle={() => setTranslationsDropdownOpen((isOpen) => !isOpen)}
                className={css.dropdown}
            >
                <DropdownToggle id={scopedId} className={css.dropdownToggle}>
                    <i
                        className="material-icons"
                        aria-label="Translate message"
                    >
                        translate
                    </i>
                </DropdownToggle>
                <Tooltip
                    target={scopedId}
                    boundariesElement="viewport"
                    placement="left"
                    offset="0, 8"
                >
                    <span>Translations menu</span>
                </Tooltip>

                <DropdownMenu right className={css.menuWrapper}>
                    <ul className={css.translationsList}>
                        {display === DisplayedContent.Original && (
                            <TranslationsItem
                                onClick={() =>
                                    setTicketMessageTranslationDisplay([
                                        {
                                            messageId,
                                            fetchingState,
                                            hasRegeneratedOnce,
                                            display:
                                                DisplayedContent.Translated,
                                        },
                                    ])
                                }
                            >
                                <span className={css.icon}>
                                    <i className="material-icons">translate</i>
                                </span>
                                <span className={css.label}>
                                    See translation
                                </span>
                            </TranslationsItem>
                        )}
                        {display === DisplayedContent.Translated && (
                            <TranslationsItem
                                onClick={() =>
                                    setTicketMessageTranslationDisplay([
                                        {
                                            messageId,
                                            fetchingState,
                                            hasRegeneratedOnce,
                                            display: DisplayedContent.Original,
                                        },
                                    ])
                                }
                            >
                                <span className={css.icon}>
                                    <i className="material-icons">undo</i>
                                </span>
                                <span className={css.label}>See original</span>
                            </TranslationsItem>
                        )}
                        <TranslationsItem
                            disabled={hasRegeneratedOnce}
                            onClick={handleRegenerateTranslation}
                        >
                            <span className={css.icon}>
                                <i className="material-icons">loop</i>
                            </span>
                            <span className={css.label}>
                                Re-generate translation
                            </span>
                        </TranslationsItem>
                    </ul>
                </DropdownMenu>
            </Dropdown>
        </>
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
