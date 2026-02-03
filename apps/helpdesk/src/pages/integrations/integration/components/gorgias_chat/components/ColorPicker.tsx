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

import { ColorGrid } from './ColorGrid'

import css from './ColorPicker.less'

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

function isValidHexColor(color: string): boolean {
    return HEX_COLOR_REGEX.test(color)
}

const DEFAULT_COLOR = '#EB144C'

export type ColorPickerProps = {
    className?: string
    value?: string | null
    defaultValue?: string
    onChange: (value: string) => void
    popupContainer?: HTMLElement | RefObject<HTMLElement> | string
    label?: string
}

export function ColorPicker({
    className,
    value,
    defaultValue = DEFAULT_COLOR,
    onChange,
    label,
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
            onChange(defaultValue)
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
                            <ColorGrid onColorSelect={handleColorSelect} />
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </div>
    )
}
