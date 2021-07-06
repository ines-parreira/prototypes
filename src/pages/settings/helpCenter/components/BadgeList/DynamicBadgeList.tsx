import React from 'react'
import {
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Input,
} from 'reactstrap'

import {BadgeItemProps} from './BadgeItem'
import {BadgeList} from './BadgeList'

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
    onSelectItem: (ev: React.MouseEvent, item: BadgeItemProps) => void
    onRemoveItem: (ev: React.MouseEvent, item: BadgeItemProps) => void
}

export const DynamicBadgeList = ({
    availableList,
    maxHeight = 215,
    searchPlaceholder = 'Start typing',
    selectedList,
    onSelectItem,
    onRemoveItem,
}: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')

    const selectedIds = selectedList.map((item) => item.id)

    const handleOnSearchItem = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(ev.target.value)
    }

    const filteredList = availableList
        .filter((item) => !selectedIds.includes(item.id))
        .filter((item) => {
            return item.text.toLowerCase().includes(search.toLocaleLowerCase())
        })

    const handleOnToggle = () => {
        if (isOpen) {
            setSearch('')
        }
        setOpen(!isOpen)
    }

    const buttonEl = filteredList.length > 0 && (
        <Dropdown direction="down" isOpen={isOpen} toggle={handleOnToggle}>
            <DropdownToggle className={css['add-btn']} type="button">
                <i className="material-icons" style={{fontSize: 16}}>
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
                style={{paddingTop: 0}}
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
