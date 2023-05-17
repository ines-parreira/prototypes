import React, {
    RefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {CustomFieldState, CustomFieldValue} from 'models/customField/types'
import {DROPDOWN_NESTING_DELIMITER} from 'models/customField/constants'
import {useUpdateOrDeleteTicketFieldValue} from 'models/customField/queries'
import {
    updateCustomFieldError,
    updateCustomFieldState,
    updateCustomFieldValue,
} from 'state/ticket/actions'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownFooter from 'pages/common/components/dropdown/DropdownFooter'
import Button from 'pages/common/components/button/Button'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import useAppSelector from 'hooks/useAppSelector'
import {getTicket} from 'state/ticket/selectors'
import Tooltip from 'pages/common/components/Tooltip'
import {isCustomFieldValueEmpty} from 'utils/customFields'
import Label from '../Label'
import StealthInput from '../StealthInput'
import css from './DropdownField.less'

const CHOICE_VALUES_SYMBOL = Symbol('value')
const PREVIOUS_BUTTON_ID = 'previous-dropdown-modal-id'

// CHOICE_VALUES_SYMBOL prevents an admin to accidentally override the key of leaf values
// While the use of a Set removes duplicate end values
type ChoicesTree = {
    [key: string]: ChoicesTree
    [CHOICE_VALUES_SYMBOL]: Set<CustomFieldValue>
}

type Props = {
    id: CustomFieldState['id']
    label: string
    fieldState?: CustomFieldState
    choices: CustomFieldValue[]
    placeholder?: string
    isRequired?: boolean
}

function getLabel(choice?: CustomFieldValue) {
    if (isCustomFieldValueEmpty(choice)) return ''
    if (typeof choice === 'boolean') {
        return choice ? 'Yes' : 'No'
    }

    return choice.toString()
}

function getStealthLabel(choice?: CustomFieldValue) {
    const _choice =
        typeof choice === 'string'
            ? (choice.split(DROPDOWN_NESTING_DELIMITER).pop() as string)
            : choice

    return getLabel(_choice)
}

function getFullValueFromCurrentPath(
    currentPath: string[],
    choice: CustomFieldValue
) {
    let value = choice
    if (typeof choice === 'string') {
        value = [...currentPath, choice].join(DROPDOWN_NESTING_DELIMITER)
    }

    return value
}

export default function DropdownField({
    id,
    label,
    fieldState,
    choices,
    isRequired,
}: Props) {
    const dispatch = useAppDispatch()
    const inputRef = useRef<HTMLInputElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)

    const ticketId = useAppSelector(getTicket).id
    const value = fieldState?.value
    const isValueEmpty = isCustomFieldValueEmpty(value)
    const hasError = fieldState?.hasError

    const inputId = `ticket-${ticketId}-custom-field-value-input-${id}`

    const [currentPath, setCurrentPath] = useState<string[]>(
        typeof value === 'string' && value.includes(DROPDOWN_NESTING_DELIMITER)
            ? value.split(DROPDOWN_NESTING_DELIMITER).slice(0, -1)
            : []
    )

    let choicesTree = useMemo(() => {
        const tree: ChoicesTree = {[CHOICE_VALUES_SYMBOL]: new Set()}
        choices.forEach((choice) => {
            if (['boolean', 'number'].includes(typeof choice)) {
                tree[CHOICE_VALUES_SYMBOL].add(choice)
            }

            if (typeof choice === 'string') {
                recursivelyMapChoice(
                    tree,
                    choice.split(DROPDOWN_NESTING_DELIMITER)
                )
            }
        })
        return tree
    }, [choices])
    currentPath.forEach(
        (nextBranchPath) =>
            (choicesTree = choicesTree[nextBranchPath] || choicesTree)
    )

    const [isActive, setActive] = useA11yDropdown(
        currentPath,
        inputRef,
        modalRef
    )

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
    // Only on blur
    const {mutate} = useUpdateOrDeleteTicketFieldValue(
        {onError},
        {isDisabled: !ticketId}
    )
    const handleChange = useCallback(
        (newValue: CustomFieldValue) => {
            setActive(false)
            dispatch(updateCustomFieldValue(id, newValue))
            dispatch(updateCustomFieldError(id, false))
            mutate([
                {
                    fieldType: 'Ticket',
                    holderId: ticketId,
                    fieldId: id,
                    value: newValue,
                },
            ])
        },
        [dispatch, id, mutate, setActive, ticketId]
    )

    const resetValue = useCallback(() => {
        dispatch(updateCustomFieldValue(id, ''))
        dispatch(updateCustomFieldError(id, false))
        mutate([
            {
                fieldType: 'Ticket',
                holderId: ticketId,
                fieldId: id,
                value: '',
            },
        ])
        setCurrentPath([])
        setActive(false)
    }, [dispatch, id, mutate, setActive, ticketId])

    // This piece of code ensures the current value still exists in the choices
    // Must be inside an useEffect to avoid concurrency issues with other dispatches
    useEffect(() => {
        if (typeof value !== 'undefined' && !choices.includes(value)) {
            dispatch(updateCustomFieldError(id, true))
            setCurrentPath([])
        }
    }, [dispatch, value, isValueEmpty, choices, id])

    return (
        <>
            <Label label={label} isRequired={isRequired}>
                {!isValueEmpty && !isActive && (
                    <Tooltip placement="left" target={inputId} autohide={false}>
                        {getLabel(value)}
                    </Tooltip>
                )}
                <StealthInput
                    id={inputId}
                    ref={inputRef}
                    name={label}
                    value={getStealthLabel(value) || ''}
                    isActive={isActive}
                    onFocus={() => {
                        logEvent(
                            SegmentEvent.CustomFieldTicketValueDropdownFocused,
                            {
                                ticketId,
                                id,
                                label,
                            }
                        )
                        setActive(true)
                    }}
                    onClick={() => setActive(true)}
                    hasError={hasError}
                />
            </Label>
            <Dropdown
                isOpen={isActive}
                onToggle={setActive}
                target={inputRef}
                ref={modalRef}
                className={css.dropdown}
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
                <DropdownBody>
                    {Object.keys(choicesTree).map((key) => {
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
                    {Array.from(choicesTree[CHOICE_VALUES_SYMBOL]).map(
                        (choice) => {
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
                                    ) === value && (
                                        <span
                                            className={`material-icons ${css.checkIcon}`}
                                        >
                                            check
                                        </span>
                                    )}
                                </DropdownItem>
                            )
                        }
                    )}
                </DropdownBody>
                {!isValueEmpty && (
                    <DropdownFooter>
                        <Button
                            onClick={resetValue}
                            fillStyle="ghost"
                            className={css.clearButton}
                        >
                            <span className={css.ellipsis}>Clear</span>
                        </Button>
                    </DropdownFooter>
                )}
            </Dropdown>
        </>
    )
}

function recursivelyMapChoice(currentBranch: ChoicesTree, values: string[]) {
    const currentValue = values.shift()

    if (!currentValue) return

    if (values.length === 0) {
        currentBranch[CHOICE_VALUES_SYMBOL].add(currentValue)
        return
    }

    if (!currentBranch[currentValue]) {
        currentBranch[currentValue] = {
            [CHOICE_VALUES_SYMBOL]: new Set(),
        }
    }
    recursivelyMapChoice(currentBranch[currentValue], values)
}

function useA11yDropdown(
    currentPath: string[],
    inputRef: RefObject<HTMLInputElement>,
    modalRef: RefObject<HTMLDivElement>
) {
    const [isActive, setActive] = useState(false)
    const modalButtonsRef = useRef<HTMLButtonElement[]>([])

    const handleActive = useCallback(
        (nextIsActive: boolean) => {
            if (!nextIsActive) {
                // focus needs to be done before setting active to false
                inputRef.current?.focus()
                inputRef.current?.blur()
            }
            setActive(nextIsActive)
        },
        [inputRef]
    )

    useEffect(() => {
        function handleKeyUp(evt: KeyboardEvent) {
            const activeElement = document.activeElement
            const modalButtons = modalButtonsRef.current

            switch (evt.key) {
                case 'Escape':
                    evt.stopPropagation()
                    handleActive(false)
                    break
                case 'Tab':
                    if (evt.shiftKey) {
                        if (modalButtons[0] === activeElement) {
                            evt.preventDefault()
                            handleActive(false)
                        }
                    } else {
                        if (
                            modalButtons[modalButtons.length - 1] ===
                            activeElement
                        ) {
                            evt.preventDefault()
                            handleActive(false)
                        }
                    }
                    break
                case 'ArrowRight':
                    evt.stopPropagation()
                    if (activeElement?.nodeName === 'BUTTON') {
                        ;(activeElement as HTMLButtonElement).click()
                    }
                    break
                case 'ArrowLeft':
                    evt.stopPropagation()
                    if (isPreviousButton(modalButtons[0])) {
                        modalButtons[0]?.click()
                    }
                    break
            }
        }

        let currentModalRef: HTMLDivElement | null = null
        if (isActive) {
            // we need to wait for the ref to update itself :/
            window.setTimeout(() => {
                currentModalRef = modalRef.current
                if (currentModalRef) {
                    modalButtonsRef.current = Array.from(
                        currentModalRef.querySelectorAll('button')
                    )
                    if (isPreviousButton(modalButtonsRef.current[0])) {
                        modalButtonsRef.current[1]?.focus()
                    } else {
                        modalButtonsRef.current[0].focus()
                    }

                    currentModalRef.addEventListener('keydown', handleKeyUp)
                }
            }, 0)
        }
        return () => {
            currentModalRef?.removeEventListener('keydown', handleKeyUp)
        }
    }, [currentPath, isActive, handleActive, modalRef, modalButtonsRef])

    return [isActive, handleActive] as const
}

function isPreviousButton(button: HTMLButtonElement) {
    return button?.id === PREVIOUS_BUTTON_ID
}
