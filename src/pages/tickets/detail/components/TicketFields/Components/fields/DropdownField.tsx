import React, {
    RefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import {CustomFieldValue} from 'models/customField/types'
import {DROPDOWN_NESTING_DELIMITER} from 'models/customField/constants'
import {OnMutateSettings} from 'models/customField/queries'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownFooter from 'pages/common/components/dropdown/DropdownFooter'
import Button from 'pages/common/components/button/Button'

import Label from '../Label'
import StealthInput from '../StealthInput'
import css from './DropdownField.less'

const CHOICE_VALUES_SYMBOL = Symbol('value')
const PREVIOUS_BUTTON_ID = 'previous-dropdown-modal-id'

type Value = string | number | readonly string[]

// Symbol prevents admin settings to override the key of the Set of end values
// Set removes duplicate end values
type ChoicesTree = {
    [key: string]: ChoicesTree
    [CHOICE_VALUES_SYMBOL]: Set<string>
}

type Props = {
    label: string
    value?: Value
    choices: string[]
    placeholder?: string
    isRequired?: boolean
    onChange: (
        newValue: CustomFieldValue['value'],
        settings?: OnMutateSettings
    ) => void
}

export default function DropdownField({
    label,
    value,
    choices,
    onChange,
    isRequired,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)

    const [currentPath, setCurrentPath] = useState<string[]>(
        typeof value === 'string' && value.includes(DROPDOWN_NESTING_DELIMITER)
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
            onChange(
                [...currentPath, newValue].join(DROPDOWN_NESTING_DELIMITER),
                {
                    previousValue: value?.toString() || '',
                }
            )
            setActive(false)
        },
        [currentPath, onChange, setActive, value]
    )

    const resetValue = useCallback(() => {
        setCurrentPath([])
        onChange('')
        setActive(false)
    }, [onChange, setActive])

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

    const currentBranch = currentPath.reduce((currentBranch, nextBranch) => {
        return currentBranch[nextBranch] || currentBranch
    }, choicesTree)

    return (
        <>
            <Label label={label} isRequired={isRequired}>
                <StealthInput
                    ref={inputRef}
                    name={label}
                    value={value || ''}
                    isActive={isActive}
                    onFocus={() => setActive(true)}
                    onClick={() => setActive(true)}
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
                                    onClick={() => handleChange(choice)}
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
