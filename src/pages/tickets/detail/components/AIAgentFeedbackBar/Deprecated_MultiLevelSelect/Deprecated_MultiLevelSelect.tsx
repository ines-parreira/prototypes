import React, {useCallback, useMemo, useRef, useState} from 'react'
import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import {buildTreeOfChoices} from './helpers/buildTreeOfChoices'
import {getLabel} from './helpers/getLabel'
import {getFullValueFromCurrentPath} from './helpers/getFullValueFromCurrentPath'
import {CHOICE_VALUES_SYMBOL, PREVIOUS_BUTTON_ID} from './constants'
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
    values: string[]
    onApplyClick: () => void
}

export default function MultiLevelSelect({
    dropdownClassName,
    choices,
    onChange,
    children,
    onToggle,
    isOpen,
    values,
    onApplyClick,
}: MultiLevelSelectProps) {
    const containerRef = useRef<HTMLSpanElement>(null)

    const [currentPath, setCurrentPath] = useState<string[]>([])

    const choicesTree = useMemo(() => buildTreeOfChoices(choices), [choices])

    let currentBranch = choicesTree
    currentPath.forEach(
        (nextBranchPath) =>
            (currentBranch = currentBranch[nextBranchPath] || currentBranch)
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

    const handleChange = useCallback(
        (newValue: string) => {
            onChange(newValue)
        },
        [onChange]
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
                <DropdownBody>
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
                    {Array.from(currentBranch[CHOICE_VALUES_SYMBOL]).map(
                        (choice) => {
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
                                    <span className={css.choiceButton}>
                                        <span className={css.ellipsis}>
                                            {label}
                                        </span>
                                    </span>
                                </DropdownItem>
                            )
                        }
                    )}
                </DropdownBody>
                {onApplyClick && currentBranch[CHOICE_VALUES_SYMBOL].size > 0 && (
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
