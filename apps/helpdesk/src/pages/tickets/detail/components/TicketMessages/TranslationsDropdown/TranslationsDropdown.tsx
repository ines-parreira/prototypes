import { useState } from 'react'

import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap'

import css from './TranslationsDropdown.less'

export function TranslationsDropdown() {
    const [isTranslationsDropdownOpen, setTranslationsDropdownOpen] =
        useState(false)

    return (
        <>
            <Dropdown
                placement="bottom-end"
                isOpen={isTranslationsDropdownOpen}
                toggle={() => setTranslationsDropdownOpen((isOpen) => !isOpen)}
                className={css.dropdown}
            >
                <DropdownToggle className={css.dropdownToggle}>
                    <i
                        className="material-icons"
                        aria-label="Translate message"
                    >
                        translate
                    </i>
                </DropdownToggle>
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
