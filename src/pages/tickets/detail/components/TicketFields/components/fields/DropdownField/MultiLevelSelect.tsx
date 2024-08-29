import React, {useCallback, useMemo, useRef, useState, RefObject} from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import {Tooltip} from '@gorgias/ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import useDimensions from 'hooks/useDimensions'
import {isCustomFieldValueEmpty} from 'utils/customFields'
import {
    CustomFieldPrediction,
    CustomFieldState,
    CustomFieldValue,
} from 'models/customField/types'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownFooter from 'pages/common/components/dropdown/DropdownFooter'
import StealthInput from 'pages/tickets/detail/components/TicketFields/components//StealthInput'
import {getCurrentUser} from 'state/currentUser/selectors'
import {hasRole} from 'utils'
import {UserRole} from 'config/types/user'

import CheckIcon from './CheckIcon'
import {useA11yDropdown} from './hooks/useA11yDropdown'
import {useSearch} from './hooks/useSearch'
import {useActiveState} from './hooks/useActiveState'
import {buildTreeOfChoices} from './helpers/buildTreeOfChoices'
import {isOutdatedValue} from './helpers/isOutdatedValue'
import {getLabel, getStealthLabel} from './helpers/getLabels'
import {getFullValueFromCurrentPath} from './helpers/getFullValueFromCurrentPath'
import {getCurrentPathFromFullValue} from './helpers/getCurrentPathFromFullValue'
import {CHOICE_VALUES_SYMBOL, PREVIOUS_BUTTON_ID} from './constants'
import {SearchResult} from './search/SearchResult'
import {SearchInput} from './search/SearchInput'
import css from './MultiLevelSelect.less'
import {usePredictionIconPositionAdjuster} from './hooks/usePredictionIconPositionAdjuster'

type Props = {
    id: CustomFieldState['id']
    dropdownClassName?: string
    label: string
    value?: CustomFieldValue
    placeholder?: string
    hasError?: boolean
    prediction?: CustomFieldPrediction
    choices: CustomFieldValue[]
    showFullValue?: boolean
    autoWidth?: boolean
    inputId: string
    hasMultipleValues?: boolean
    onChange: (value: CustomFieldValue) => void
    onFocus?: () => void
    children?: React.ReactNode
    onToggle?: () => void
    isOpen?: boolean
    isDisabled?: boolean
    values?: string[]
}

export default function MultiLevelSelect({
    id,
    dropdownClassName,
    label,
    value,
    placeholder = '+Add',
    hasError = false,
    prediction,
    choices,
    showFullValue = false,
    autoWidth = false,
    inputId,
    hasMultipleValues = false,
    onChange,
    onFocus,
    children,
    onToggle,
    isOpen,
    isDisabled = false,
    values,
}: Props) {
    const containerRef = useRef<HTMLSpanElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)
    const [inputRef, inputDimensions] = useDimensions()

    const isValueEmpty = isCustomFieldValueEmpty(value)
    const displayValue = showFullValue
        ? getLabel(value)
        : getStealthLabel(value)

    const [previousValue, setPreviousValue] =
        useState<Maybe<CustomFieldValue>>(null)

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
        inputRef: inputRef as unknown as RefObject<HTMLInputElement>,
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

    const handleChange = useCallback(
        (newValue: CustomFieldValue) => {
            !hasMultipleValues && setActive(false)
            onChange(newValue)
        },
        [hasMultipleValues, setActive, onChange]
    )

    const handleFocus = useCallback(() => {
        if (!isActive && onFocus) {
            onFocus()
        }
        setActive(true)
    }, [isActive, setActive, onFocus])

    // Update the currentPath to match the value
    if (value !== previousValue) {
        setPreviousValue(value)
        if (isOutdatedValue(value, choices)) {
            setCurrentPath([])
        } else {
            setCurrentPath(getCurrentPathFromFullValue(value))
        }
    }

    const isPredictionCorrect =
        prediction?.display === true &&
        prediction.predicted === value &&
        ((prediction.confirmed === true && prediction.modified === false) ||
            (prediction.confirmed === false && prediction.modified === false))

    const {iconLeft, hiddenRef} = usePredictionIconPositionAdjuster({
        value,
        inputDimensions,
        shouldShowIcon: isPredictionCorrect,
    })

    return (
        <>
            {children ? (
                <span ref={containerRef}>{children}</span>
            ) : (
                <span
                    id={inputId}
                    className={classNames(css.wrapper, {
                        [css.autoWidthInputContainer]: autoWidth,
                        [css.placeholder]: isValueEmpty,
                    })}
                    ref={containerRef}
                >
                    {autoWidth && (
                        <span
                            onClick={isDisabled ? undefined : handleFocus}
                            className={css.autoWidthSpan}
                        >
                            {isValueEmpty ? placeholder : displayValue}
                        </span>
                    )}
                    <StealthInput
                        id={inputId + '-input'}
                        className={
                            isPredictionCorrect && hiddenRef.current
                                ? css.inputWithPredictionIcon
                                : undefined
                        }
                        ref={inputRef}
                        name={label}
                        value={displayValue}
                        isDisabled={isDisabled}
                        placeholder={placeholder}
                        isActive={false}
                        onFocus={handleFocus}
                        hasError={hasError}
                    />
                    <span ref={hiddenRef} className={css.hiddenInputValue} />
                    {isPredictionCorrect && hiddenRef.current && (
                        <i
                            className={`material-icons ${css.predictionIcon}`}
                            style={{left: `${iconLeft}px`}}
                        >
                            auto_awesome
                        </i>
                    )}
                </span>
            )}
            {!children && !choices.length && (
                <EmptyHelper target={containerRef} id={id} />
            )}
            <Dropdown
                isOpen={isOpen ?? isActive}
                onToggle={(isActiveNext) => {
                    if (!isActiveNext) {
                        setCurrentPath(getCurrentPathFromFullValue(value))
                    }
                    setActive(isActiveNext)
                    onToggle?.()
                }}
                target={containerRef}
                ref={modalRef}
                className={classNames(dropdownClassName, {
                    [css.dropdown]: !children,
                })}
                isMultiple={hasMultipleValues}
                value={values}
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
                            {Array.from(
                                currentBranch[CHOICE_VALUES_SYMBOL]
                            ).map((choice) => {
                                const label = getLabel(choice)
                                const fullValue = getFullValueFromCurrentPath(
                                    currentPath,
                                    choice
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
                                        {fullValue === prediction?.predicted &&
                                            isPredictionCorrect && (
                                                <i
                                                    className={`material-icons mr-2 ${css.predictionIcon}`}
                                                >
                                                    auto_awesome
                                                </i>
                                            )}
                                        <span className={css.choiceButton}>
                                            <span className={css.ellipsis}>
                                                {label}
                                            </span>
                                        </span>
                                        {fullValue === value && <CheckIcon />}
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

type EmptyHelperProps = {
    target: RefObject<HTMLElement>
    id: number
}

export function EmptyHelper({target, id}: EmptyHelperProps) {
    const currentUser = useAppSelector(getCurrentUser)
    const isAdmin = hasRole(currentUser, UserRole.Admin)

    return (
        <Tooltip
            target={target}
            placement="top-start"
            autohide={false}
            arrowClassName={css.emptyHelperArrow}
            innerProps={{
                modifiers: {
                    preventOverflow: {boundariesElement: 'viewport'},
                },
            }}
        >
            {isAdmin ? (
                <>
                    This field does not have any values yet.
                    <br />
                    <Link
                        to={`/app/settings/ticket-fields/${id}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Go to Settings
                    </Link>{' '}
                    to set up the field.
                </>
            ) : (
                'This field does not have any values yet. Contact your Admin to set up this field.'
            )}
        </Tooltip>
    )
}
