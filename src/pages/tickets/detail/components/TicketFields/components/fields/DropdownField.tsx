import React, {
    RefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {CustomFieldState} from 'models/customField/types'
import {DROPDOWN_NESTING_DELIMITER} from 'models/customField/constants'
import {OnMutateSettings} from 'models/customField/queries'
import {
    updateCustomFieldError,
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
import Label from '../Label'
import StealthInput from '../StealthInput'
import css from './DropdownField.less'

const CHOICE_VALUES_SYMBOL = Symbol('value')
const PREVIOUS_BUTTON_ID = 'previous-dropdown-modal-id'

// Symbol prevents admin settings to override the key of the Set of end values
// Set removes duplicate end values
type ChoicesTree = {
    [key: string]: ChoicesTree
    [CHOICE_VALUES_SYMBOL]: Set<string>
}

type Props = {
    id: CustomFieldState['id']
    label: string
    fieldState?: CustomFieldState
    choices: string[]
    placeholder?: string
    isRequired?: boolean
    onChange: (
        newValue: CustomFieldState['value'],
        settings?: OnMutateSettings
    ) => void
}

export default function DropdownField({
    id,
    label,
    fieldState,
    choices,
    onChange,
    isRequired,
}: Props) {
    const dispatch = useAppDispatch()
    const inputRef = useRef<HTMLInputElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)

    const ticketId = useAppSelector(getTicket).id
    const value = fieldState?.value?.toString() || ''
    const hasError = fieldState?.hasError

    const [currentPath, setCurrentPath] = useState<string[]>(
        value.includes(DROPDOWN_NESTING_DELIMITER)
            ? value.split(DROPDOWN_NESTING_DELIMITER).slice(0, -1)
            : []
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

    const [isActive, setActive] = useA11yDropdown(
        currentPath,
        inputRef,
        modalRef
    )

    const handleChange = useCallback(
        (newValue: string) => {
            onChange(newValue, {
                previousState: {
                    id,
                    hasError: Boolean((isRequired && !value) || hasError),
                    value,
                },
            })
            setActive(false)
            dispatch(updateCustomFieldValue(id, newValue))
            dispatch(updateCustomFieldError(id, false))
        },
        [dispatch, id, onChange, setActive, isRequired, value, hasError]
    )

    const resetValue = useCallback(() => {
        dispatch(updateCustomFieldValue(id, ''))
        onChange('')
        setCurrentPath([])
        if (isRequired) {
            dispatch(updateCustomFieldError(id, true))
        }
        setActive(false)
    }, [dispatch, isRequired, id, onChange, setActive])

    const choicesTree = useMemo(() => {
        const choicesTree: ChoicesTree = {[CHOICE_VALUES_SYMBOL]: new Set()}
        choices.forEach((choice) => {
            recursivelyMapChoice(
                choicesTree,
                choice.split(DROPDOWN_NESTING_DELIMITER)
            )
        })
        return choicesTree
    }, [choices])

    // Must be inside an useEffect to avoid concurrency
    // issues with other dispatch
    useEffect(() => {
        // value is outdated
        if (value && !choices.includes(value)) {
            dispatch(updateCustomFieldError(id, true))
        }
    }, [dispatch, value, choices, id])

    const currentBranch = currentPath.reduce((currentBranch, nextBranch) => {
        return currentBranch[nextBranch] || currentBranch
    }, choicesTree)

    return (
        <>
            <Label label={label} isRequired={isRequired}>
                <StealthInput
                    ref={inputRef}
                    name={label}
                    value={value.split(DROPDOWN_NESTING_DELIMITER).pop()}
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
                onToggle={(isActive) => {
                    if (isActive === false && !value && isRequired) {
                        dispatch(updateCustomFieldError(id, true))
                    }
                    setActive(isActive)
                }}
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
                    {Object.keys(currentBranch).map((key) => (
                        <DropdownItem
                            key={key}
                            tag="button"
                            onClick={() => goNext(key)}
                            option={{label: key, value: key}}
                        >
                            <span className={css.choiceButton}>
                                <span className={css.ellipsis}>{key}</span>
                                <span
                                    className={`material-icons ${css.nextIcon}`}
                                >
                                    navigate_next
                                </span>
                            </span>
                        </DropdownItem>
                    ))}
                    {Array.from(currentBranch[CHOICE_VALUES_SYMBOL]).map(
                        (choice) => {
                            return (
                                <DropdownItem
                                    key={choice}
                                    tag="button"
                                    onClick={() =>
                                        handleChange(
                                            [...currentPath, choice].join(
                                                DROPDOWN_NESTING_DELIMITER
                                            )
                                        )
                                    }
                                    option={{label: choice, value: choice}}
                                >
                                    <span className={css.choiceButton}>
                                        <span
                                            className={css.ellipsis}
                                        >{`${choice}`}</span>
                                    </span>
                                    {[...currentPath, choice].join(
                                        DROPDOWN_NESTING_DELIMITER
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
                {Boolean(value) && (
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
