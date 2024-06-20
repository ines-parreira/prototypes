import React, {useRef, useState} from 'react'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {useOnClickOutside} from 'pages/common/hooks/useOnClickOutside'
import css from './TagSearchSelect.less'

type Props = {
    onSelect: (name: string) => void
    defaultTag: string | undefined
}

const TagSearchSelect = ({onSelect, defaultTag}: Props) => {
    const dropdownAnchor = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedTag, setSelectedTag] = useState<string | undefined>(
        defaultTag
    )
    // Mock data, this will be replaced by an actual fetch in the next iteration
    const tags = [
        {
            id: 13,
            decoration: {
                color: '#b070b2',
            },
            name: 'ai_snooze',
            usage: 0,
            uri: '/api/tags/13/',
            created_datetime: '2024-05-24T16:28:35.038429+00:00',
        },
        {
            id: 12,
            decoration: {
                color: '#3ca67e',
            },
            name: 'ai_processing',
            usage: 3,
            uri: '/api/tags/12/',
            created_datetime: '2024-05-14T14:05:44.564076+00:00',
        },
        {
            id: 11,
            decoration: {
                color: '#55b073',
            },
            name: 'ai_ignore',
            usage: 0,
            uri: '/api/tags/11/',
            created_datetime: '2024-04-17T12:29:11.917767+00:00',
        },
    ]

    const handleTagSelection = (tagName: string) => {
        setSelectedTag(tagName)
        setIsOpen(false)
        onSelect(tagName)
    }

    useOnClickOutside(dropdownRef, () => {
        if (isOpen) {
            setIsOpen(false)
        }
    })

    return (
        <div>
            <div
                className={css.dropdownSelection}
                ref={dropdownAnchor}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedTag ? (
                    selectedTag
                ) : (
                    <div className={css.dropdownPlaceholder}>
                        Choose tag
                        <span>
                            <i className="material-icons md-2">
                                arrow_drop_down
                            </i>
                        </span>
                    </div>
                )}
            </div>
            <Dropdown
                ref={dropdownRef}
                isOpen={isOpen}
                onToggle={() => {}}
                target={dropdownAnchor}
            >
                <DropdownSearch
                    className={css.dropdownSearch}
                    placeholder="Search"
                />
                {tags.map(
                    (t) =>
                        t.name && (
                            <DropdownItem
                                key={t.id}
                                className={css.dropdownItem}
                                onClick={() => handleTagSelection(t.name)}
                                option={{
                                    label: t.name,
                                    value: t.name,
                                }}
                            />
                        )
                )}
            </Dropdown>
        </div>
    )
}

export default TagSearchSelect
