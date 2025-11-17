import type React from 'react'
import { useRef, useState } from 'react'

import type { LegacyButtonSize } from '@gorgias/axiom'
import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import type { GuidanceVariable } from 'pages/aiAgent/components/GuidanceEditor/variables.types'

import GuidanceVariableDropdown from './GuidanceVariableDropdown'

export type GuidanceVariablePickerProps = {
    onSelect: (value: GuidanceVariable) => void
    label?: string
    disabled?: boolean
    size?: LegacyButtonSize
    tooltipMessage?: string | null
    variableDropdownProps?: Partial<
        React.ComponentProps<typeof GuidanceVariableDropdown>
    >
}

const GuidanceVariablePicker = ({
    onSelect,
    label = `{+} variables`,
    size = 'small',
    tooltipMessage = 'Insert variable',
    variableDropdownProps,
    disabled,
}: GuidanceVariablePickerProps) => {
    const anchorEl = useRef<HTMLButtonElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const handleToggle = () => {
        setIsOpen(!isOpen)
    }

    return (
        <>
            <Button
                size={size}
                intent="secondary"
                ref={anchorEl}
                isDisabled={disabled}
                onClick={handleToggle}
                trailingIcon="arrow_drop_down"
            >
                {label}
            </Button>
            {tooltipMessage && (
                <Tooltip target={anchorEl}>{tooltipMessage}</Tooltip>
            )}
            <GuidanceVariableDropdown
                target={anchorEl}
                onSelect={onSelect}
                isOpen={isOpen}
                onToggle={setIsOpen}
                {...variableDropdownProps}
            />
        </>
    )
}

export default GuidanceVariablePicker
