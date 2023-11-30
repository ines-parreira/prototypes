import React, {useRef, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Tooltip from 'pages/common/components/Tooltip'

import WorkflowVariableDropdown from './WorkflowVariableDropdown'

export type WorkflowVariablePickerProps = {
    onSelect: (value: string) => void
}

const WorkflowVariablePicker = ({onSelect}: WorkflowVariablePickerProps) => {
    const anchorEl = useRef<HTMLButtonElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const handleToggle = () => {
        setIsOpen(!isOpen)
    }

    return (
        <>
            <Button
                size="small"
                intent="secondary"
                ref={anchorEl}
                onClick={handleToggle}
            >
                {`{+}`} variables
                <ButtonIconLabel icon="arrow_drop_down" position="right" />
            </Button>
            <Tooltip target={anchorEl}>
                Variables are automatically created and can be used to recall
                information from previous steps in a flow
            </Tooltip>
            <WorkflowVariableDropdown
                target={anchorEl}
                onSelect={onSelect}
                isOpen={isOpen}
                onToggle={setIsOpen}
            />
        </>
    )
}

export default WorkflowVariablePicker
