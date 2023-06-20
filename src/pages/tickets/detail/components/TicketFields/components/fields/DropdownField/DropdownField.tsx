import React, {useCallback, useMemo, useRef, useState, useEffect} from 'react'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {useUpdateOrDeleteTicketFieldValue} from 'hooks/customField/useUpdateOrDeleteTicketFieldValue'
import {isCustomFieldValueEmpty} from 'utils/customFields'
import {CustomFieldState, CustomFieldValue} from 'models/customField/types'
import {getTicket} from 'state/ticket/selectors'
import {
    updateCustomFieldError,
    updateCustomFieldState,
    updateCustomFieldValue,
} from 'state/ticket/actions'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownFooter from 'pages/common/components/dropdown/DropdownFooter'
import Label from 'pages/tickets/detail/components/TicketFields/components/Label'
import StealthInput from 'pages/tickets/detail/components/TicketFields/components//StealthInput'
import Tooltip from 'pages/common/components/Tooltip'

import {useA11yDropdown} from './hooks/useA11yDropdown'
import {useSearch} from './hooks/useSearch'
import {useActiveState} from './hooks/useActiveState'
import {buildTreeOfChoices} from './helpers/buildTreeOfChoices'
import {getLabel, getStealthLabel} from './helpers/getLabels'
import {getFullValueFromCurrentPath} from './helpers/getFullValueFromCurrentPath'
import {getCurrentPathFromFullValue} from './helpers/getCurrentPathFromFullValue'
import {CHOICE_VALUES_SYMBOL, PREVIOUS_BUTTON_ID} from './constants'
import {SearchResult} from './search/SearchResult'
import {SearchInput} from './search/SearchInput'
import css from './DropdownField.less'

type Props = {
    id: CustomFieldState['id']
    label: string
    fieldState?: CustomFieldState
    choices: CustomFieldValue[]
    isRequired?: boolean
    isLarge?: boolean
}

export default function DropdownField({
    id,
    label,
    fieldState,
    choices,
    isRequired,
    isLarge = false,
}: Props) {
    const dispatch = useAppDispatch()
    const ticketId = useAppSelector(getTicket).id
    const inputId = `ticket-${ticketId}-custom-field-value-input-${id}`

    const inputRef = useRef<HTMLInputElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)

    const value = fieldState?.value
    const isValueEmpty = isCustomFieldValueEmpty(value)
    const hasError = fieldState?.hasError

    const [currentPath, setCurrentPath] = useState<string[]>(
        getCurrentPathFromFullValue(value)
    )

    const choicesTree = useMemo(() => buildTreeOfChoices(choices), [choices])

    let currentBranch = choicesTree
    currentPath.forEach(
        (nextBranchPath) =>
            (currentBranch = currentBranch[nextBranchPath] || currentBranch)
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
    const [isActive, setActive] = useActiveState(setSearch)
    useA11yDropdown({
        isActive,
        setActive,
        currentPath,
        inputRef,
        modalRef,
    })

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

    const onError = useCallback(() => {
        dispatch(
            updateCustomFieldState({
                id,
                hasError: Boolean((isRequired && isValueEmpty) || hasError),
                value,
            })
        )
    }, [value, isValueEmpty, dispatch, id, isRequired, hasError])

    const {mutate} = useUpdateOrDeleteTicketFieldValue(
        {onError},
        {isDisabled: !ticketId}
    )

    const handleChange = useCallback(
        (newValue: CustomFieldValue) => {
            setActive(false)
            setCurrentPath(getCurrentPathFromFullValue(newValue))
            dispatch(updateCustomFieldValue(id, newValue))
            if (isCustomFieldValueEmpty(newValue && isRequired)) {
                dispatch(updateCustomFieldError(id, true))
            } else {
                dispatch(updateCustomFieldError(id, false))
            }
            mutate([
                {
                    fieldType: 'Ticket',
                    holderId: ticketId,
                    fieldId: id,
                    value: newValue,
                },
            ])
        },
        [dispatch, id, mutate, setActive, ticketId, isRequired]
    )

    // outdated value, keep in a use effect to avoid infinite loop
    useEffect(() => {
        if (!isValueEmpty && value !== undefined && !choices.includes(value)) {
            dispatch(updateCustomFieldError(id, true))
            setCurrentPath([])
        }
    }, [dispatch, id, isValueEmpty, value, choices])

    return (
        <>
            <Label label={label} isRequired={isRequired}>
                {!isValueEmpty && (
                    <Tooltip placement="left" target={inputId} autohide={false}>
                        {getLabel(value)}
                    </Tooltip>
                )}
                <StealthInput
                    id={inputId}
                    ref={inputRef}
                    name={label}
                    value={getStealthLabel(value)}
                    isActive={false}
                    isLarge={isLarge}
                    onFocus={() => {
                        if (!isActive) {
                            logEvent(
                                SegmentEvent.CustomFieldTicketValueDropdownFocused,
                                {
                                    ticketId,
                                    id,
                                    label,
                                }
                            )
                        }
                        setActive(true)
                    }}
                    hasError={hasError}
                />
            </Label>
            <Dropdown
                isOpen={isActive}
                onToggle={(isActiveNext) => {
                    if (!isActiveNext) {
                        setCurrentPath(getCurrentPathFromFullValue(value))
                    }
                    setActive(isActiveNext)
                }}
                target={inputRef}
                ref={modalRef}
                className={css.dropdown}
            >
                {currentPath.length > 0 && !isSearching && (
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
                        dropdownName={label}
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
                                        option={{label, value: key}}
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
                            {Array.from(
                                currentBranch[CHOICE_VALUES_SYMBOL]
                            ).map((choice) => {
                                const label = getLabel(choice)
                                return (
                                    <DropdownItem
                                        key={choice.toString()}
                                        tag="button"
                                        onClick={() => {
                                            handleChange(
                                                getFullValueFromCurrentPath(
                                                    currentPath,
                                                    choice
                                                )
                                            )
                                        }}
                                        option={{
                                            label,
                                            value: choice,
                                        }}
                                    >
                                        <span className={css.choiceButton}>
                                            <span className={css.ellipsis}>
                                                {label}
                                            </span>
                                        </span>
                                        {getFullValueFromCurrentPath(
                                            currentPath,
                                            choice
                                        ) === value && <CheckIcon />}
                                    </DropdownItem>
                                )
                            })}
                        </>
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
            </Dropdown>
        </>
    )
}

export function CheckIcon() {
    return <span className={`material-icons ${css.checkIcon}`}>check</span>
}
