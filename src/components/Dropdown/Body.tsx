import React, {KeyboardEvent, useCallback, useContext, useRef} from 'react'
import cn from 'classnames'

import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import dropdownItemCss from 'pages/common/components/dropdown/DropdownItem.less'
import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'

import Context, {Item} from './Context'
import focusOnNextItem from './focusOnNextItem'
import css from './style.less'

const Body = () => {
    const context = useContext(Context)
    if (!context) {
        throw new Error(
            'Body must be used within a components/Dropdown/Context.Provider'
        )
    }
    const searchInputRef = useRef<HTMLInputElement>(null)
    const {data, isLoading, onClick, search, setSearch, wrapperRef} = context

    const handleClick = useCallback(
        (item: Item) => {
            if (!item.name) {
                return
            }

            onClick?.(item)
            searchInputRef.current?.focus()
        },
        [onClick, searchInputRef]
    )

    const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
        focusOnNextItem(e, wrapperRef)
    }

    return (
        <>
            <div className={css.search}>
                <TextInput
                    ref={searchInputRef}
                    role="listitem"
                    placeholder="Search"
                    onChange={setSearch}
                    onKeyDown={onKeyDown}
                    prefix={<IconInput icon="search" />}
                    value={search}
                    autoFocus
                />
            </div>
            <DropdownBody
                className={css.body}
                isLoading={isLoading}
                role="list"
            >
                {!!data?.length ? (
                    data.map((item, i) => {
                        const name = item.name
                        return (
                            <DropdownItem
                                key={item.id}
                                className={css.item}
                                option={{
                                    label: name || '',
                                    value: name || '',
                                }}
                                onClick={() => handleClick(item)}
                                role="listitem"
                                onKeyDown={
                                    i === 0 || i === data.length - 1
                                        ? onKeyDown
                                        : undefined
                                }
                            >
                                {name}
                            </DropdownItem>
                        )
                    })
                ) : (
                    <div
                        className={cn(
                            dropdownItemCss.item,
                            dropdownItemCss.disabled
                        )}
                    >
                        No results
                    </div>
                )}
            </DropdownBody>
        </>
    )
}

export default Body
