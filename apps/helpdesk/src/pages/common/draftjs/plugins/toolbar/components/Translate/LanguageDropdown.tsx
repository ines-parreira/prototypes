import { RefObject, useRef } from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'

import css from './Translate.less'

interface LanguageDropdownProps {
    isOpen: boolean
    searchTerm: string
    filteredLanguages: Array<{ code: string; name: string }>
    buttonRef: RefObject<HTMLButtonElement>
    onClose: () => void
    onSearchChange: (term: string) => void
    onLanguageSelect: (code: string) => void
}

export default function LanguageDropdown({
    isOpen,
    searchTerm,
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
