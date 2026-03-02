import type React from 'react'
import { useRef, useState } from 'react'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'
import type { LegacyButtonSize } from '@gorgias/axiom'

import type { WorkflowVariable } from 'pages/automate/workflows/models/variables.types'

import WorkflowVariableDropdown from './WorkflowVariableDropdown'

export type WorkflowVariablePickerProps = {
    onSelect: (value: WorkflowVariable) => void
    label?: string
    disabled?: boolean
    size?: LegacyButtonSize
    tooltipMessage?: string | null
    variableDropdownProps?: Partial<
        React.ComponentProps<typeof WorkflowVariableDropdown>
    >
}

const WorkflowVariablePicker = ({
    onSelect,
    label = `{+} variables`,
    size = 'small',
    tooltipMessage = 'Variables are automatically created and can be used to recall information from previous steps in a flow',
    variableDropdownProps,
    disabled,
}: WorkflowVariablePickerProps) => {
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
            <WorkflowVariableDropdown
                target={anchorEl}
                onSelect={onSelect}
                isOpen={isOpen}
                onToggle={setIsOpen}
                {...variableDropdownProps}
            />
        </>
    )
}

export default WorkflowVariablePicker
