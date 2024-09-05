import React, {useRef, useState} from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import {TagDropdownMenu} from 'tags'

import css from './TagSearchSelect.less'

type Props = {
    onSelect: (name: string) => void
    defaultTag?: string
}

const TagSearchSelect = ({onSelect, defaultTag}: Props) => {
    const dropdownAnchor = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedTag, setSelectedTag] = useState<string | undefined>(
        defaultTag
    )

    const handleTagSelection = (tagName?: string) => {
        if (typeof tagName === 'string') {
            setSelectedTag(tagName)
            setIsOpen(false)
            onSelect(tagName)
        }
    }

    return (
        <>
            <div
                className={css.selection}
                ref={dropdownAnchor}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedTag || (
                    <div className={css.placeholder}>
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
                isOpen={isOpen}
                onToggle={setIsOpen}
                target={dropdownAnchor}
                placement="top-start"
                contained
            >
                <TagDropdownMenu
                    onClick={(item) => handleTagSelection(item.name)}
                />
            </Dropdown>
        </>
    )
}

export default TagSearchSelect
