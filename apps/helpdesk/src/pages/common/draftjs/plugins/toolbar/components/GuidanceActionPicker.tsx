import type React from 'react'
import { useRef, useState } from 'react'

import { Link } from 'react-router-dom'

import { LegacyButton as Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { useToolbarContext } from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'

import GuidanceActionDropdown from './GuidanceActionDropdown'

import css from './GuidanceActionDropdown.less'

export type GuidanceActionPickerProps = {
    onSelect: (value: GuidanceAction) => void
    disabled?: boolean
    actionDropdownProps?: Partial<
        React.ComponentProps<typeof GuidanceActionDropdown>
    >
}

const GuidanceActionPicker = ({
    onSelect,
    actionDropdownProps,
}: GuidanceActionPickerProps) => {
    const { guidanceActions = [], shopName } = useToolbarContext()
    const { routes } = useAiAgentNavigation({ shopName: shopName || '' })

    const anchorEl = useRef<HTMLButtonElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const handleToggle = () => {
        setIsOpen(!isOpen)
    }
    const isDisabled = guidanceActions.length === 0

    return (
        <>
            {isDisabled ? (
                <Tooltip
                    trigger={
                        <Button
                            size="small"
                            intent="secondary"
                            ref={anchorEl}
                            onClick={handleToggle}
                            leadingIcon="webhook"
                            trailingIcon="arrow_drop_down"
                            isDisabled={isDisabled}
                        >
                            Actions
                        </Button>
                    }
                >
                    <TooltipContent>
                        <div className={css.tooltipDisabled}>
                            To use <Link to={routes.actions}>Actions</Link> in
                            Guidance, enable at least one Action for AI Agent.
                        </div>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <Button
                    size="small"
                    intent="secondary"
                    ref={anchorEl}
                    onClick={handleToggle}
                    leadingIcon="webhook"
                    trailingIcon="arrow_drop_down"
                    isDisabled={isDisabled}
                >
                    Actions
                </Button>
            )}
            <GuidanceActionDropdown
                target={anchorEl}
                onSelect={onSelect}
                isOpen={isOpen}
                onToggle={setIsOpen}
                {...actionDropdownProps}
            />
        </>
    )
}

export default GuidanceActionPicker
