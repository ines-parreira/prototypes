import { useState } from 'react'
import type { ChangeEvent, FC, MouseEvent } from 'react'

import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
} from 'reactstrap'

import { BadgeItemProps } from 'pages/common/components/BadgetItem'

import { BadgeList } from './BadgeList'

import css from './DynamicBadgeList.less'

//   We need these two props for the dropdown
// options on top of BadgeItemProps
export type BadgeSelectItem = BadgeItemProps & {
    text: string
    value: string | number | boolean
}

type Props = {
    availableList: BadgeSelectItem[]
    maxHeight?: number
    searchPlaceholder?: string
    selectedList: BadgeItemProps[]
    onSelectItem: (ev: MouseEvent, item: BadgeItemProps) => void
    onRemoveItem: (ev: MouseEvent, item: BadgeItemProps) => void
}

export const DynamicBadgeList: FC<Props> = ({
    availableList,
    maxHeight = 215,
    searchPlaceholder = 'Start typing',
    selectedList,
    onSelectItem,
    onRemoveItem,
}: Props) => {
    const [isOpen, setOpen] = useState(false)
    const [search, setSearch] = useState('')

    const selectedIds = selectedList.map((item) => item.id)

    const handleOnSearchItem = (ev: ChangeEvent<HTMLInputElement>) => {
        setSearch(ev.target.value)
    }

    const filteredList = availableList
        .filter((item) => !selectedIds.includes(item.id))
        .filter((item) => {
            return item.text.toLowerCase().includes(search.toLocaleLowerCase())
        })

    const shouldDisplayButton = availableList.some(
        (item) => !selectedIds.includes(item.id),
    )

    const handleOnToggle = () => {
        if (isOpen) {
            setSearch('')
        }
        setOpen(!isOpen)
    }

    const buttonEl = shouldDisplayButton && (
        <Dropdown direction="down" isOpen={isOpen} toggle={handleOnToggle}>
            <DropdownToggle className={css['add-btn']} type="button">
                <i className="material-icons" style={{ fontSize: 16 }}>
                    add
                </i>
            </DropdownToggle>
            <DropdownMenu
                modifiers={{
                    setMaxHeight: {
                        enabled: true,
                        order: 890,
                        fn: (data) => {
                            return {
                                ...data,
                                styles: {
                                    ...data.styles,
                                    overflow: 'auto',
                                    maxHeight: `${maxHeight}px`,
                                },
                            }
                        },
                    },
                }}
                style={{ paddingTop: 0 }}
            >
                <div className={css['dropdown-header']}>
                    <div>
                        <Input
                            value={search}
                            autoFocus
                            placeholder={searchPlaceholder}
                            onChange={handleOnSearchItem}
                        />
                        <DropdownItem divider />
                    </div>
                </div>
                {filteredList.map((item) => (
                    <DropdownItem
                        key={item.id}
                        onClick={(ev) => onSelectItem(ev, item)}
                    >
                        {item.label}
                    </DropdownItem>
                ))}
                {!filteredList.length && (
                    <DropdownItem>No language found</DropdownItem>
                )}
            </DropdownMenu>
        </Dropdown>
    )

    return (
        <BadgeList
            list={selectedList}
            suffix={buttonEl}
            onRemoveItem={onRemoveItem}
        />
    )
}
