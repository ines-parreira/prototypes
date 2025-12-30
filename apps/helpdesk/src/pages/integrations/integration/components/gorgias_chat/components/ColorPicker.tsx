import type { RefObject } from 'react'
import { useCallback, useState } from 'react'

import {
    autoUpdate,
    flip,
    FloatingFocusManager,
    FloatingPortal,
    offset,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
} from '@floating-ui/react'
import cn from 'classnames'

import { Button, TextField } from '@gorgias/axiom'

import css from './ColorPicker.less'

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

function isValidHexColor(color: string): boolean {
    return HEX_COLOR_REGEX.test(color)
}

const defaultColors = [
    '#EB144C',
    '#FF6900',
    '#FCB900',
    '#B5CC18',
    '#00D084',
    '#7BDCB5',
    '#8ED1FC',
    '#0693E3',
    '#9900EF',
    '#E03997',
    '#F78DA7',
    '#A5673F',
    '#ABB8C3',
    '#767676',
]

export type ColorPickerProps = {
    className?: string
    value?: string | null
    defaultValue?: string
    onChange: (value: string) => void
    colors?: string[]
    popupContainer?: HTMLElement | RefObject<HTMLElement> | string
    label?: string
    shouldStopPropagation?: boolean
}

export function ColorPicker({
    className,
    colors = defaultColors,
    value,
    defaultValue,
    onChange,
    label,
    shouldStopPropagation,
}: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    const colorValue = value || defaultValue

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: 'bottom-start',
        middleware: [offset(4), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    })

    const click = useClick(context)
    const dismiss = useDismiss(context)
    const role = useRole(context)

    const { getReferenceProps, getFloatingProps } = useInteractions([
        click,
        dismiss,
        role,
    ])

    const handleColorSelect = useCallback(
        (selectedColor: string) => {
            onChange(selectedColor)
            setIsOpen(false)
        },
        [onChange],
    )

    const handleInputChange = useCallback(
        (newValue: string) => {
            onChange(newValue.trim())
        },
        [onChange],
    )

    const handleBlur = useCallback(() => {
        if (!value || !isValidHexColor(value)) {
            onChange(defaultValue ?? defaultColors[0])
        }
    }, [value, defaultValue, onChange])

    const ariaLabel = label
        ? `color-picker_${label.replace(/\s/g, '_').toLowerCase()}`
        : 'color-picker'

    const colorTrigger = (
        <Button
            ref={refs.setReference}
            variant="secondary"
            slot="button"
            aria-label={ariaLabel}
            icon={
                <div
                    className={css.colorSwatch}
                    style={{
                        backgroundColor: colorValue || '#FFFFFF',
                    }}
                />
            }
            {...getReferenceProps()}
        />
    )

    return (
        <div className={cn(css.wrapper, className)}>
            <TextField
                className={css.textField}
                value={value ?? ''}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="#000000"
                size="md"
                leadingSlot={colorTrigger}
            />

            {isOpen && (
                <FloatingPortal>
                    <FloatingFocusManager context={context} modal={false}>
                        <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            className={css.popup}
                            {...getFloatingProps()}
                        >
                            <div className={css.colorGrid}>
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={css.colorChoice}
                                        style={{ backgroundColor: color }}
                                        aria-label={`Select color ${color}`}
                                        onClick={(e) => {
                                            if (shouldStopPropagation) {
                                                e.stopPropagation()
                                            }
                                            handleColorSelect(color)
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </div>
    )
}
