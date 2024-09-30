import React, {RefObject, useCallback, useRef, useState} from 'react'
import {Popover, PopoverBody, Input} from 'reactstrap'
import cn from 'classnames'

import useId from 'hooks/useId'
import {useOnClickOutside} from 'pages/common/hooks/useOnClickOutside'
import Button from 'pages/common/components/button/Button'

import css from './ColorPicker.less'

const defaultColors = [
    '#EB144C', // red
    '#FF6900', // orange
    '#FCB900', // yellow
    '#B5CC18', // olive
    '#00D084', // green
    '#7BDCB5', // teal
    '#8ED1FC', // light blue
    '#0693E3', // blue
    '#9900EF', // purple
    '#E03997', // pink
    '#F78DA7', // light pink
    '#A5673F', // brown
    '#ABB8C3', // light grey
    '#767676', // grey
]

export type Props = {
    className?: string
    value?: string | null
    defaultValue?: string
    onChange: (value: string) => void
    colors?: string[]
    popupContainer?: HTMLElement | RefObject<HTMLElement> | string
    label?: string
}

export default function ColorPicker({
    className,
    colors = defaultColors,
    value,
    defaultValue,
    onChange,
    popupContainer,
    label,
}: Props) {
    const [isPopupVisible, setPopupVisible] = useState(false)
    const popupContentEl = useRef<HTMLDivElement>(null)
    const buttonEl = useRef<HTMLButtonElement>(null)
    const id = useId()
    const popoverId = 'color-picker-' + id
    useOnClickOutside<HTMLDivElement>(popupContentEl, (evt) => {
        if (
            evt.target !== buttonEl.current &&
            (evt.target as HTMLElement | null)?.parentElement !==
                buttonEl.current
        )
            setPopupVisible(false)
    })
    const handleClickChoice = useCallback(
        (value: string) => {
            onChange(value)
            setPopupVisible(false)
        },
        [onChange]
    )

    const colorValue = value || defaultValue

    const ariaLabel = label
        ? `color-picker-button_${label.replace(/\s/g, '_').toLowerCase()}`
        : undefined

    return (
        <div className={cn(css.wrapper, className)}>
            <Button
                id={popoverId}
                intent="secondary"
                onClick={() => setPopupVisible(!isPopupVisible)}
                ref={buttonEl}
                className={css.button}
                data-testid={ariaLabel} // used in e2e tests
                aria-label={ariaLabel}
            >
                {colorValue ? (
                    <div
                        className={css.color}
                        style={{
                            backgroundColor: colorValue,
                        }}
                    />
                ) : (
                    'Pick a color'
                )}
            </Button>
            <Input
                data-testid="color-picker-input" // used in e2e tests
                className={css.input}
                value={value ?? undefined}
                onChange={(evt) => {
                    onChange(evt.target.value.trim())
                }}
                placeholder="ex: #eeeeee"
            />
            <Popover
                placement="bottom"
                isOpen={isPopupVisible}
                target={popoverId}
                container={popupContainer}
            >
                <PopoverBody className={css['popover-content']}>
                    <div className={css.popup} ref={popupContentEl}>
                        {(colors || defaultColors).map((color) => {
                            return (
                                <button
                                    key={color}
                                    type="button"
                                    className={css.choice}
                                    style={{
                                        backgroundColor: color,
                                    }}
                                    aria-label={`color ${color}`}
                                    onClick={() => handleClickChoice(color)}
                                />
                            )
                        })}
                    </div>
                </PopoverBody>
            </Popover>
        </div>
    )
}
