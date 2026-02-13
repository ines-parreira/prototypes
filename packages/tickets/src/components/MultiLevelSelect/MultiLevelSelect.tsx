import { useCallback, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'

import {
    Button,
    Icon,
    IconName,
    ListFooter,
    ListHeader,
    ListItem,
    Select,
    SelectTrigger,
    TextField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { getDisplayLabel } from './helpers/tree'
import { useOptionsTree } from './hooks/useOptionsTree'
import type { TreeOption, TreeValue } from './types'

type Props = {
    id?: string
    choices: TreeValue[]
    placeholder?: string
    isDisabled?: boolean
    isLoading?: boolean
    isInvalid?: boolean
    isSearchable?: boolean
    ariaLabel?: string
    selectedValue?: TreeValue
    onSelect: (value: TreeValue | undefined) => void
    showTooltip?: boolean
}

export function MultiLevelSelect(props: Props) {
    const {
        id,
        choices,
        selectedValue,
        onSelect,
        placeholder,
        isDisabled,
        isLoading,
        isInvalid,
        isSearchable,
        ariaLabel,
        showTooltip = false,
    } = props

    const [isOpen, setIsOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    // serves as a flag to prevent closing the dropdown when navigating
    const isNavigatingRef = useRef(false)

    const {
        selectOptions,
        selectedOption,
        goBack,
        goToLevel,
        resetPath,
        navigationState,
    } = useOptionsTree({
        choices,
        selectedValue,
        searchTerm: searchValue,
    })

    const handleSelect = useCallback(
        (option: TreeOption) => {
            if (option.hasChildren && !searchValue) {
                isNavigatingRef.current = true
                goToLevel(option)
                return
            }

            onSelect(option.value)
            isNavigatingRef.current = false
        },
        [onSelect, goToLevel, searchValue],
    )

    const handleGoBack = useCallback(() => {
        isNavigatingRef.current = true
        goBack()
    }, [goBack])

    const handleClear = useCallback(() => {
        onSelect(undefined)
        isNavigatingRef.current = false
        setIsOpen(false)
    }, [onSelect])

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
        ({
            isOpen,
            ref,
        }: {
            isOpen: boolean
            ref: RefObject<HTMLButtonElement>
        }) => {
            const label = getDisplayLabel(selectedValue)

            // inspired by Axiom SelectField
            // migrate to Axiom SelectField once missing props are supported
            return (
                <SelectTrigger>
                    <TextField
                        id={id}
                        aria-label={
                            ariaLabel
                                ? `${ariaLabel} selected value`
                                : placeholder
                        }
                        inputRef={ref as RefObject<HTMLInputElement>}
                        isFocused={isOpen}
                        trailingSlot={
                            isOpen ? 'arrow-chevron-up' : 'arrow-chevron-down'
                        }
                        variant="secondary"
                        size="sm"
                        value={label ?? ''}
                        placeholder={placeholder}
                        isInvalid={isInvalid}
                    />
                </SelectTrigger>
            )
        },
        [selectedValue, placeholder, ariaLabel, isInvalid, id],
    )

    const tooltipContent = useMemo(
        () => getDisplayLabel(selectedValue, true),
        [selectedValue],
    )

    return (
        <Tooltip isDisabled={!showTooltip || !tooltipContent} placement="left">
            <Select
                aria-labelledby={id}
                items={selectOptions}
                placeholder={placeholder}
                isDisabled={isDisabled}
                isLoading={isLoading}
                isSearchable={isSearchable}
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
                size="sm"
                header={
                    navigationState.canGoBack && (
                        <ListHeader>
                            <Button
                                size="sm"
                                variant="tertiary"
                                onClick={handleGoBack}
                                leadingSlot={IconName.ArrowChevronLeft}
                            >
                                {navigationState.parentLevelName}
                            </Button>
                        </ListHeader>
                    )
                }
                footer={
                    !!selectedOption && (
                        <ListFooter>
                            <Button
                                size="sm"
                                variant="tertiary"
                                onClick={handleClear}
                            >
                                Clear selection
                            </Button>
                        </ListFooter>
                    )
                }
            >
                {(option: TreeOption) => (
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
                )}
            </Select>
            <TooltipContent title={tooltipContent || undefined} />
        </Tooltip>
    )
}
