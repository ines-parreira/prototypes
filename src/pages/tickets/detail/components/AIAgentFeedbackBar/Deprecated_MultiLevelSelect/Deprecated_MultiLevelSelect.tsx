import React, { useCallback, useMemo, useRef, useState } from 'react'

import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownFooter from 'pages/common/components/dropdown/DropdownFooter'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import { useSearch } from '../hooks/useSearch'
import { CHOICE_VALUES_SYMBOL, PREVIOUS_BUTTON_ID } from './constants'
import { buildTreeOfChoices } from './helpers/buildTreeOfChoices'
import { getFullValueFromCurrentPath } from './helpers/getFullValueFromCurrentPath'
import { getLabel } from './helpers/getLabel'
import { SearchInput } from './search/SearchInput'
import { SearchResult } from './search/SearchResult'

import css from './Deprecated_MultiLevelSelect.less'

export type MultiLevelSelectProps = {
    id: number
    dropdownClassName?: string
    choices: string[]
    inputId: string
    onChange: (value: string) => void
    children: React.ReactNode
    onToggle: () => void
    isOpen: boolean
    value?: string
    values: string[]
    onApplyClick: () => void
}

/**
 * @deprecated
 * @date 2024-10-04
 * @type ui-component
 */
export default function MultiLevelSelect({
    dropdownClassName,
    choices,
    onChange,
    children,
    onToggle,
    isOpen,
    value,
    values,
    onApplyClick,
}: MultiLevelSelectProps) {
    const containerRef = useRef<HTMLSpanElement>(null)

    const [currentPath, setCurrentPath] = useState<string[]>([])

    const choicesTree = useMemo(() => buildTreeOfChoices(choices), [choices])

    let currentBranch = choicesTree
    currentPath.forEach(
        (nextBranchPath) =>
            (currentBranch = currentBranch[nextBranchPath] || currentBranch),
    )

    const isSearchDisabled =
        choices.length > 0 && typeof choices[0] !== 'string'

    const {
        search,
        setSearch,
        isSearching,
        searchResults,
        valueIsInSearchResults,
    } = useSearch({
        choices: choicesTree,
        dropdownValue: value,
        isDisabled: isSearchDisabled,
    })

    const isValueEmpty =
        typeof value === 'undefined' || typeof value === 'string'

    const goPrevious = useCallback(() => {
        setCurrentPath((currentPath) => {
            return currentPath.slice(0, -1)
        })
    }, [])

    const goNext = useCallback((additionalEntry: string) => {
        setCurrentPath((currentPath) => {
            return [...currentPath, additionalEntry]
        })
    }, [])

    const handleChange = useCallback(
        (newValue: string) => {
            onChange(newValue)
        },
        [onChange],
    )

    return (
        <>
            <span ref={containerRef}>{children}</span>

            <Dropdown
                isOpen={isOpen}
                onToggle={() => {
                    onToggle?.()
                }}
                target={containerRef}
                className={classNames(dropdownClassName, {
                    [css.dropdown]: !children,
                })}
                isMultiple={true}
                value={values}
            >
                {currentPath.length > 0 && (
                    <DropdownHeader>
                        <Button
                            onClick={goPrevious}
                            fillStyle="ghost"
                            id={PREVIOUS_BUTTON_ID}
                            className={css.backButton}
                        >
                            <span className={css.ellipsis}>
                                <span
                                    className={`material-icons ${css.backIcon}`}
                                >
                                    arrow_back
                                </span>
                                {currentPath[currentPath.length - 1]}
                            </span>
                        </Button>
                    </DropdownHeader>
                )}
                {!isSearchDisabled && (
                    <SearchInput
                        search={search}
                        setSearch={setSearch}
                        dropdownName="deprecated-multi-level-select"
                    />
                )}
                <DropdownBody>
                    {isSearching ? (
                        <>
                            {searchResults.length ? (
                                searchResults.map((searchResult) => (
                                    <DropdownItem
                                        key={searchResult.value.toString()}
                                        tag="button"
                                        onClick={() =>
                                            handleChange(searchResult.value)
                                        }
                                        option={{
                                            value: searchResult.value,
                                            label: '', // we don’t need it here
                                        }}
                                    >
                                        <SearchResult
                                            {...searchResult}
                                            currentValue={value}
                                            currentSearch={search}
                                        />
                                    </DropdownItem>
                                ))
                            ) : (
                                <div className={css.noResults}>No results</div>
                            )}
                        </>
                    ) : (
                        <>
                            {Object.keys(currentBranch).map((key) => {
                                const label = getLabel(key)
                                return (
                                    <DropdownItem
                                        key={key}
                                        tag="button"
                                        onClick={() => goNext(key)}
                                        option={{ label, value: key }}
                                        hasSubItems
                                    >
                                        <span className={css.choiceButton}>
                                            <span className={css.ellipsis}>
                                                {label}
                                            </span>
                                            <span
                                                className={`material-icons ${css.nextIcon}`}
                                            >
                                                navigate_next
                                            </span>
                                        </span>
                                    </DropdownItem>
                                )
                            })}
                        </>
                    )}
                    {Array.from(currentBranch[CHOICE_VALUES_SYMBOL]).map(
                        (choice) => {
                            const label = getLabel(choice)
                            const fullValue = getFullValueFromCurrentPath(
                                currentPath,
                                choice,
                            )
                            return (
                                <DropdownItem
                                    key={choice.toString()}
                                    tag="button"
                                    onClick={() => {
                                        handleChange(fullValue)
                                    }}
                                    option={{
                                        label,
                                        value: fullValue,
                                    }}
                                >
                                    <span className={css.choiceButton}>
                                        <span className={css.ellipsis}>
                                            {label}
                                        </span>
                                    </span>
                                </DropdownItem>
                            )
                        },
                    )}
                </DropdownBody>
                {((!isValueEmpty && !isSearching) ||
                    valueIsInSearchResults) && (
                    <DropdownFooter className={css.modalFooter}>
                        <Button
                            onClick={() => handleChange('')}
                            fillStyle="ghost"
                            className={css.clearButton}
                        >
                            Clear Selection
                        </Button>
                    </DropdownFooter>
                )}
                {onApplyClick &&
                    currentBranch[CHOICE_VALUES_SYMBOL].size > 0 && (
                        <div
                            className={css.applyButtonContainer}
                            onClick={onApplyClick}
                        >
                            <Button fillStyle={'ghost'}>Apply</Button>
                        </div>
                    )}
            </Dropdown>
        </>
    )
}
