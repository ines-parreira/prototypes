import React, { useRef, useState } from 'react'

import { Link } from 'react-router-dom'

import { Button, Tooltip } from '@gorgias/merchant-ui-kit'

import actionsIconDisabled from 'assets/img/icons/guidance-actions-disabled.svg'
import actionsIcon from 'assets/img/icons/guidance-actions.svg'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
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
            <Button
                size="small"
                intent="secondary"
                ref={anchorEl}
                onClick={handleToggle}
                trailingIcon="arrow_drop_down"
                isDisabled={isDisabled}
            >
                <img
                    src={isDisabled ? actionsIconDisabled : actionsIcon}
                    alt={'Actions'}
                    className={css.icon}
                />{' '}
                Actions
            </Button>
            <GuidanceActionDropdown
                target={anchorEl}
                onSelect={onSelect}
                isOpen={isOpen}
                onToggle={setIsOpen}
                {...actionDropdownProps}
            />
            {anchorEl && isDisabled && (
                <Tooltip target={anchorEl} placement="top" autohide={false}>
                    <div className={css.tooltipDisabled}>
                        To use <Link to={routes.actions}>Actions</Link> in
                        Guidance, enable at least one Action for AI Agent.
                    </div>
                </Tooltip>
            )}
        </>
    )
}

export default GuidanceActionPicker
