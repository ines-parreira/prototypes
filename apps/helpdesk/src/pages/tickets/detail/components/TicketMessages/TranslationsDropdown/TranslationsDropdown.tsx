import { useState } from 'react'

import { useId } from '@repo/hooks'
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import css from './TranslationsDropdown.less'

export function TranslationsDropdown() {
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
                        <TranslationsItem onClick={() => {}}>
                            <span className={css.icon}>
                                <i className="material-icons">translate</i>
                            </span>
                            <span className={css.label}>See translation</span>
                        </TranslationsItem>
                        <TranslationsItem onClick={() => {}}>
                            <span className={css.icon}>
                                <i className="material-icons">undo</i>
                            </span>
                            <span className={css.label}>See original</span>
                        </TranslationsItem>
                        <TranslationsItem onClick={() => {}}>
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

type TranslationsItemProps = {
    onClick: () => void
    children: React.ReactNode
}

function TranslationsItem({ children, onClick }: TranslationsItemProps) {
    return (
        <li key="translation-item" className={css.translationsListItem}>
            <button className={css.translationsItem} onClick={onClick}>
                <div className={css.translationsItemContent}>{children}</div>
            </button>
        </li>
    )
}
