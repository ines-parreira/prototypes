import React, {RefObject, useCallback, useRef, useMemo, useState} from 'react'
import _uniqueId from 'lodash/uniqueId'
import {Popover, PopoverBody, Input} from 'reactstrap'

import {useOnClickOutside} from 'pages/common/hooks/useOnClickOutside'
import Button, {ButtonIntent} from 'pages/common/components/button/Button'

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
    value?: string
    defaultValue?: string
    onChange: (value: string) => void
    colors?: string[]
    popupContainer?: HTMLElement | RefObject<HTMLElement> | string
}

export default function ColorPicker({
    colors = defaultColors,
    value,
    defaultValue,
    onChange,
    popupContainer,
}: Props) {
    const [isPopupVisible, setPopupVisible] = useState(false)
    const popupContentEl = useRef<HTMLDivElement>(null)
    const buttonEl = useRef<HTMLButtonElement>(null)
    const uniqueId = useMemo(() => _uniqueId('color-picker-'), [])
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

    return (
        <div className="d-inline-block">
            <Button
                id={uniqueId}
                intent={ButtonIntent.Secondary}
                onClick={() => setPopupVisible(!isPopupVisible)}
                ref={buttonEl}
            >
                {value || defaultValue ? (
                    <div
                        className={css.color}
                        style={{
                            backgroundColor: value || defaultValue,
                        }}
                    />
                ) : (
                    'Pick a color'
                )}
            </Button>
            <Popover
                placement="right"
                isOpen={isPopupVisible}
                target={uniqueId}
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
                                    onClick={() => handleClickChoice(color)}
                                />
                            )
                        })}
                        <Input
                            bsSize="sm"
                            className={css.input}
                            value={value}
                            onChange={(evt) => {
                                onChange(evt.target.value)
                            }}
                            placeholder="ex: #eeeeee"
                        />
                    </div>
                </PopoverBody>
            </Popover>
        </div>
    )
}
