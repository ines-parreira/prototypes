import { useCallback, useMemo, useRef, useState } from 'react'
import type { ComponentType, RefObject } from 'react'

import { Placement } from '@floating-ui/react'
import classNames from 'classnames'
import _xor from 'lodash/xor'
import { Link } from 'react-router-dom'

import { Skeleton, Tooltip } from '@gorgias/merchant-ui-kit'

import { UserRole } from 'config/types/user'
import StealthInput from 'custom-fields/components/StealthInput'
import {
    getShortValueLabel,
    getValueLabel,
} from 'custom-fields/helpers/getValueLabels'
import { isCustomFieldValueEmpty } from 'custom-fields/helpers/isCustomFieldValueEmpty'
import {
    CustomFieldPrediction,
    CustomFieldState,
    CustomFieldValue,
} from 'custom-fields/types'
import useAppSelector from 'hooks/useAppSelector'
import useDimensions from 'hooks/useDimensions'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownFooter from 'pages/common/components/dropdown/DropdownFooter'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

import CheckIcon from './CheckIcon'
import { CHOICE_VALUES_SYMBOL, PREVIOUS_BUTTON_ID } from './constants'
import { buildTreeOfChoices } from './helpers/buildTreeOfChoices'
import { getCurrentPathFromFullValue } from './helpers/getCurrentPathFromFullValue'
import { getFullValueFromCurrentPath } from './helpers/getFullValueFromCurrentPath'
import isMultiValueEmpty from './helpers/isMultiValueEmpty'
import { isOutdatedValue } from './helpers/isOutdatedValue'
import { useA11yDropdown } from './hooks/useA11yDropdown'
import { useActiveState } from './hooks/useActiveState'
import { usePredictionIconPositionAdjuster } from './hooks/usePredictionIconPositionAdjuster'
import { useSearch } from './hooks/useSearch'
import { SearchInput } from './search/SearchInput'
import { SearchResult } from './search/SearchResult'
import { CustomInputProps } from './types'

import css from './MultiLevelSelect.less'

function isMultiValueAllowed<T extends boolean | undefined>(
    allowMultiValues: T,
    __value: CustomFieldValue | CustomFieldValue[] | undefined,
): __value is CustomFieldValue[] {
    return allowMultiValues === true
}

type InferCustomFieldValueType<AllowMultiValues extends boolean | undefined> =
    AllowMultiValues extends true ? CustomFieldValue[] : CustomFieldValue

export type MultiLevelSelectProps<
    AllowMultiValues extends boolean | undefined = false,
> = {
    id?: CustomFieldState['id']
    label?: string
    placeholder?: string
    hasError?: boolean
    choices: CustomFieldValue[]
    showFullValue?: boolean
    autoWidth?: boolean
    dropdownAutoWidth?: boolean
    inputId: string
    onFocus?: () => void
    isDisabled?: boolean
    allowMultiValues?: AllowMultiValues
    value?: InferCustomFieldValueType<AllowMultiValues> | undefined
    prediction?: CustomFieldPrediction
    onChange: (
        value: InferCustomFieldValueType<AllowMultiValues> | undefined,
    ) => void
    customDisplayValue?: (
        value: InferCustomFieldValueType<AllowMultiValues> | undefined,
    ) => string
    CustomInput?: ComponentType<CustomInputProps>
    placement?: Placement
    dropdownMatchTriggerWidth?: boolean
    hideClearButton?: boolean
    wrapperClassName?: string
    isLoading?: boolean
}

export default function MultiLevelSelect<
    AllowMultiValues extends boolean | undefined = false,
>({
    id,
    label,
    value,
    placeholder = '+Add',
    hasError = false,
    prediction,
    choices,
    showFullValue = false,
    customDisplayValue,
    CustomInput,
    autoWidth = false,
    dropdownAutoWidth = false,
    inputId,
    onChange,
    onFocus,
    isDisabled = false,
    allowMultiValues = false,
    placement,
    dropdownMatchTriggerWidth = false,
    hideClearButton = false,
    wrapperClassName,
    isLoading = false,
}: MultiLevelSelectProps<AllowMultiValues>) {
    const containerRef = useRef<HTMLSpanElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)
    const [inputRef, inputDimensions] = useDimensions()

    const isValueEmpty = isMultiValueAllowed(allowMultiValues, value)
        ? isMultiValueEmpty(value)
        : isCustomFieldValueEmpty(value)

    const displayValue = customDisplayValue
        ? customDisplayValue(value)
        : showFullValue || isMultiValueAllowed(allowMultiValues, value)
          ? getValueLabel(value)
          : getShortValueLabel(value)

    const [previousValue, setPreviousValue] =
        useState<Maybe<CustomFieldValue>>(null)

    const [currentPath, setCurrentPath] = useState<string[]>(
        isMultiValueAllowed(allowMultiValues, value)
            ? []
            : getCurrentPathFromFullValue(value),
    )

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
            if (!allowMultiValues) setActive(false)
            isMultiValueAllowed(allowMultiValues, value)
                ? onChange(
                      (!newValue
                          ? []
                          : _xor(
                                [newValue],
                                value,
                            )) as unknown as InferCustomFieldValueType<AllowMultiValues>,
                  )
                : onChange(
                      newValue as unknown as InferCustomFieldValueType<AllowMultiValues>,
                  )
        },
        [setActive, allowMultiValues, value, onChange],
    )

    const handleFocus = useCallback(() => {
        if (!isActive && onFocus) {
            onFocus()
        }
        setActive(true)
    }, [isActive, setActive, onFocus])

    // Update the currentPath to match the value
    if (
        !isMultiValueAllowed(allowMultiValues, value) &&
        value !== previousValue
    ) {
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

    const { iconLeft, hiddenRef } = usePredictionIconPositionAdjuster({
        value: isMultiValueAllowed(allowMultiValues, value) ? undefined : value,
        inputDimensions,
        shouldShowIcon: isPredictionCorrect,
    })

    return (
        <>
            <span
                ref={containerRef}
                id={inputId}
                className={classNames(css.wrapper, {
                    [css.autoWidthInputContainer]: autoWidth,
                    [css.placeholder]: isValueEmpty,
                })}
            >
                {autoWidth && (
                    <span
                        onClick={isDisabled ? undefined : handleFocus}
                        className={css.autoWidthSpan}
                    >
                        {isValueEmpty ? placeholder : displayValue}
                    </span>
                )}
                {CustomInput ? (
                    <CustomInput
                        id={inputId + '-input'}
                        value={displayValue}
                        placeholder={placeholder}
                        isDisabled={isDisabled}
                        onFocus={handleFocus}
                        isOpen={isActive}
                        ref={inputRef}
                    />
                ) : (
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
                )}
                <span ref={hiddenRef} className={css.hiddenInputValue} />
                {isPredictionCorrect && hiddenRef.current && (
                    <i
                        className={`material-icons ${css.predictionIcon}`}
                        style={{ left: `${iconLeft}px` }}
                    >
                        auto_awesome
                    </i>
                )}
            </span>
            {!choices.length && typeof id !== 'undefined' && (
                <EmptyHelper target={containerRef} id={id} />
            )}
            <Dropdown
                isOpen={isActive}
                onToggle={(state) => {
                    setCurrentPath([])
                    setActive(state)
                }}
                target={containerRef}
                ref={modalRef}
                className={classNames(
                    dropdownAutoWidth ? undefined : css.dropdown,
                    wrapperClassName,
                )}
                placement={placement}
                matchTriggerWidth={dropdownMatchTriggerWidth}
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
                    {isLoading ? (
                        <>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <DropdownItem
                                    key={`skeleton-${index}`}
                                    tag="div"
                                    onClick={() => {}}
                                    option={{
                                        label: '',
                                        value: '',
                                    }}
                                >
                                    <Skeleton height={20} width={100} />
                                </DropdownItem>
                            ))}
                        </>
                    ) : isSearching ? (
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
                            {Object.keys(currentBranch).map((choice) => {
                                const label = getValueLabel(choice)
                                return (
                                    <DropdownItem
                                        key={choice}
                                        tag="button"
                                        onClick={() => goNext(choice)}
                                        option={{ label, value: choice }}
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
                                currentBranch[CHOICE_VALUES_SYMBOL],
                            ).map((choice) => {
                                const label = getValueLabel(choice)
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
                                            value: choice,
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
                                        {(isMultiValueAllowed(
                                            allowMultiValues,
                                            value,
                                        )
                                            ? value?.includes(fullValue)
                                            : fullValue === value) && (
                                            <CheckIcon />
                                        )}
                                    </DropdownItem>
                                )
                            })}
                        </>
                    )}
                </DropdownBody>
                {!hideClearButton &&
                    ((!isValueEmpty && !isSearching) ||
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

export function EmptyHelper({ target, id }: EmptyHelperProps) {
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
                    preventOverflow: { boundariesElement: 'viewport' },
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
