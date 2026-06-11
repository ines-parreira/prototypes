import type { RefObject } from 'react'
import { useRef } from 'react'

import { Separator } from '@gorgias/axiom'

import { Dropdown } from 'pages/common/components/dropdown/Dropdown'
import { DefaultExportDropdownBody as DropdownBody } from 'pages/common/components/dropdown/DropdownBody'
import { DefaultExportDropdownHeader as DropdownHeader } from 'pages/common/components/dropdown/DropdownHeader'
import { DefaultExportDropdownItem as DropdownItem } from 'pages/common/components/dropdown/DropdownItem'
import { DefaultExportDropdownSearch as DropdownSearch } from 'pages/common/components/dropdown/DropdownSearch'

import css from './Translate.less'

interface LanguageDropdownProps {
    isOpen: boolean
    searchTerm: string
    detectedLanguage?: { code: string; name: string }
    filteredLanguages: Array<{ code: string; name: string }>
    buttonRef: RefObject<HTMLButtonElement>
    onClose: () => void
    onSearchChange: (term: string) => void
    onLanguageSelect: (code: string) => void
}

export function LanguageDropdown({
    isOpen,
    searchTerm,
    detectedLanguage,
    filteredLanguages,
    buttonRef,
    onClose,
    onSearchChange,
    onLanguageSelect,
}: LanguageDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null)

    const handleLanguageClick = (code: string) => {
        onLanguageSelect(code)
        onClose()
    }

    return (
        <Dropdown
            isOpen={isOpen}
            onToggle={onClose}
            ref={dropdownRef}
            target={buttonRef}
            className={css.translateDropdown}
            value={searchTerm}
            placement="right-end"
        >
            <DropdownHeader>Translate to</DropdownHeader>
            <DropdownSearch
                autoFocus
                placeholder="Search"
                value={searchTerm}
                onChange={onSearchChange}
            />
            <DropdownBody>
                {detectedLanguage && (
                    <div className={css.detectedLanguageContainer}>
                        <span className={css.translateDropdownText}>
                            Detected language
                        </span>
                        <DropdownItem
                            key={detectedLanguage.code}
                            option={{
                                label: detectedLanguage.name,
                                value: detectedLanguage.code,
                            }}
                            onClick={() =>
                                handleLanguageClick(detectedLanguage.code)
                            }
                            shouldCloseOnSelect
                        >
                            {detectedLanguage.name}
                        </DropdownItem>
                        <Separator className={css.detectedLanguageSeparator} />
                        <span className={css.translateDropdownText}>
                            All languages (A{`->`}Z)
                        </span>
                    </div>
                )}

                {filteredLanguages.map(({ code, name }) => (
                    <DropdownItem
                        key={code}
                        option={{
                            label: name,
                            value: code,
                        }}
                        onClick={() => handleLanguageClick(code)}
                        shouldCloseOnSelect
                    >
                        {name}
                    </DropdownItem>
                ))}
            </DropdownBody>
        </Dropdown>
    )
}
