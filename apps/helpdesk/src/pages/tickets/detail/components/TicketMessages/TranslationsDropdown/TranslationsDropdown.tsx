import { useState } from 'react'

import { useId } from '@repo/hooks'
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap'

import { Tooltip } from '@gorgias/axiom'

import {
    DisplayedContent,
    FetchingState,
} from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'
import { useTicketMessageTranslationDisplay } from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/useTicketMessageTranslationDisplay'

import css from './TranslationsDropdown.less'

type TranslationsDropdownProps = {
    messageId: number
}

export function TranslationsDropdown({ messageId }: TranslationsDropdownProps) {
    const {
        getTicketMessageTranslationDisplay,
        setTicketMessageTranslationDisplay,
    } = useTicketMessageTranslationDisplay()
    const displayType = getTicketMessageTranslationDisplay(messageId)

    const [isTranslationsDropdownOpen, setTranslationsDropdownOpen] =
        useState(false)
    const id = useId()
    const scopedId = `translations-dropdown-${id}`

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
                        {displayType.display === DisplayedContent.Original && (
                            <TranslationsItem
                                onClick={() =>
                                    setTicketMessageTranslationDisplay([
                                        {
                                            messageId,
                                            ...displayType,
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
                        {displayType.display ===
                            DisplayedContent.Translated && (
                            <TranslationsItem
                                onClick={() =>
                                    setTicketMessageTranslationDisplay([
                                        {
                                            messageId,
                                            ...displayType,
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
                        {displayType.fetchingState === FetchingState.Failed && (
                            <TranslationsItem onClick={() => {}}>
                                <span className={css.icon}>
                                    <i className="material-icons">loop</i>
                                </span>
                                <span className={css.label}>
                                    Re-generate translation
                                </span>
                            </TranslationsItem>
                        )}
                    </ul>
                </DropdownMenu>
            </Dropdown>
        </>
    )
}

type TranslationsItemProps = {
    onClick: () => void
    children: React.ReactNode
}

function TranslationsItem({ children, onClick }: TranslationsItemProps) {
    return (
        <li className={css.translationsListItem}>
            <button className={css.translationsItem} onClick={onClick}>
                <div className={css.translationsItemContent}>{children}</div>
            </button>
        </li>
    )
}
