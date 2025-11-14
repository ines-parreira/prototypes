import { useCallback, useRef, useState } from 'react'

import { Icon, IconName, ListItem, Select, Tag } from '@gorgias/axiom'

import { getDisplayLabel, isBackButton, isClearButton } from './helpers/tree'
import { useOptionsTree } from './hooks/useOptionsTree'
import type { Option, TreeValue } from './types'

type Props = {
    choices: TreeValue[]
    placeholder?: string
    isDisabled?: boolean
    isLoading?: boolean
    ariaLabel?: string
    selectedValue?: TreeValue
    onSelect: (value: TreeValue | undefined) => void
}

export function MultiLevelSelect(props: Props) {
    const {
        choices,
        selectedValue,
        onSelect,
        placeholder,
        isDisabled,
        isLoading,
        ariaLabel,
    } = props

    const [isOpen, setIsOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    // serves as a flag to prevent closing the dropdown when navigating
    const isNavigatingRef = useRef(false)

    const { selectOptions, selectedOption, goBack, goToLevel, resetPath } =
        useOptionsTree({
            choices,
            selectedValue,
            searchTerm: searchValue,
        })

    const handleSelect = useCallback(
        (option: Option) => {
            if (isBackButton(option)) {
                isNavigatingRef.current = true
                goBack()
                return
            }

            if (isClearButton(option)) {
                onSelect(undefined)
                isNavigatingRef.current = false
                return
            }

            if (option.hasChildren && !searchValue) {
                isNavigatingRef.current = true
                goToLevel(option)
                return
            }

            onSelect(option.value)
            isNavigatingRef.current = false
        },
        [onSelect, goToLevel, goBack, searchValue],
    )

    const handleOpenChange = useCallback(
        (newIsOpen: boolean) => {
            if (!newIsOpen && isNavigatingRef.current) {
                isNavigatingRef.current = false
                return
            }

            setIsOpen(newIsOpen)
            if (!newIsOpen) {
                resetPath()
                setSearchValue('')
            }
        },
        [resetPath],
    )

    const handleSearchChange = useCallback((value: string) => {
        setSearchValue(value)
    }, [])

    const trigger = useCallback(
        ({ isOpen }: { isOpen: boolean }) => {
            const label = getDisplayLabel(selectedValue)

            return (
                <Tag
                    leadingSlot={
                        label === null ? (
                            <Icon name={IconName.AddPlus} size="sm" />
                        ) : undefined
                    }
                    trailingSlot={
                        <Icon
                            name={
                                isOpen
                                    ? IconName.ArrowChevronUp
                                    : IconName.ArrowChevronDown
                            }
                            size="xs"
                        />
                    }
                >
                    {label || placeholder}
                </Tag>
            )
        },
        [selectedValue, placeholder],
    )

    return (
        <Select
            items={selectOptions}
            placeholder={placeholder}
            isDisabled={isDisabled}
            isLoading={isLoading}
            isSearchable
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            aria-label={ariaLabel}
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            trigger={trigger}
            keyName="id"
            selectedItem={selectedOption}
            onSelect={handleSelect}
            minWidth={139}
            maxWidth={139}
            maxHeight={258}
        >
            {(option: Option) => {
                if (isBackButton(option)) {
                    return (
                        <ListItem
                            key={option.id}
                            textValue={option.label}
                            label={option.label}
                            leadingSlot={
                                <Icon
                                    name={IconName.ArrowChevronLeft}
                                    size="sm"
                                />
                            }
                        />
                    )
                }

                if (isClearButton(option)) {
                    return (
                        <ListItem
                            key={option.id}
                            textValue={option.label}
                            label={option.label}
                        />
                    )
                }

                return (
                    <ListItem
                        key={option.id}
                        textValue={option.label}
                        label={option.label}
                        caption={option.caption}
                        trailingSlot={
                            option.hasChildren && !searchValue ? (
                                <Icon
                                    name={IconName.ArrowChevronRight}
                                    size="sm"
                                />
                            ) : undefined
                        }
                    />
                )
            }}
        </Select>
    )
}
