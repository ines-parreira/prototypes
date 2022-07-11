import React, {ReactNode, useState} from 'react'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import classnames from 'classnames'

import Tooltip from '../../../../../common/components/Tooltip'

import {Messages} from './constants'

import css from './IntentsFeedbackDropdown.less'

export const IntentsFeedbackDropdown = ({
    label,
    messageId,
    onToggle,
    availableIntentsNames,
    activeIntentsNames,
    renderAvailableIntent,
    renderActiveIntent,
    renderContentOnly,
    onContentMouseLeave,
    onBack,
}: {
    label: string
    messageId: number
    onToggle: (state: boolean) => void
    activeIntentsNames: string[]
    availableIntentsNames: string[]
    renderAvailableIntent: (intent: string) => ReactNode
    renderActiveIntent: (intent: string) => ReactNode
    renderContentOnly?: boolean
    onContentMouseLeave?: () => void
    onBack?: () => void
}) => {
    const tooltipContainer = `intent-tooltip-${messageId}`

    const [isOpen, setOpen] = useState(false)

    const _setOpen = (newState: boolean) => {
        onToggle(newState)
        setOpen(newState)
    }

    const dropdownMenuContent = (
        <>
            <div id={tooltipContainer} />
            <div className={classnames(css.header)}>
                {onBack && (
                    <i
                        className="material-icons mr-1 cursor-pointer"
                        onClick={() => {
                            onBack && onBack()
                            onToggle(isOpen)
                        }}
                    >
                        arrow_back
                    </i>
                )}
                Message intents
                <i
                    className={classnames('material-icons', 'ml-2', css.info)}
                    id={`intent-info-${messageId}`}
                >
                    info_outline
                </i>
                <Tooltip
                    className={css.headerTooltip}
                    target={`intent-info-${messageId}`}
                    container={tooltipContainer}
                    fade={false}
                >
                    {Messages.TOOLTIP_HEADER_INFO}
                </Tooltip>
            </div>
            <div className={css.options}>
                <DropdownItem className={classnames(css.subheader)} header>
                    {label}
                </DropdownItem>
                {activeIntentsNames.map(renderActiveIntent)}
                <DropdownItem divider />
                {
                    <DropdownItem className={classnames(css.subheader)} header>
                        Other intents
                    </DropdownItem>
                }
                {availableIntentsNames.map(renderAvailableIntent)}
            </div>
        </>
    )

    if (renderContentOnly)
        return (
            <div
                onMouseLeave={() => {
                    _setOpen(false)
                    onContentMouseLeave && onContentMouseLeave()
                }}
            >
                {dropdownMenuContent}
            </div>
        )

    return (
        <div className={css.wrapper}>
            <Dropdown
                toggle={() => _setOpen(!isOpen)}
                isOpen={isOpen}
                onMouseLeave={() => _setOpen(false)}
            >
                <DropdownToggle className={css.toggleMenu}>
                    <span className={classnames('mr-1', css.menuLabel)}>
                        {label}
                    </span>
                    <span className={classnames(css.caret, 'material-icons')}>
                        arrow_drop_down
                    </span>
                </DropdownToggle>
                <DropdownMenu className={css.menuWrapper} right>
                    <div className={css.menu}>{dropdownMenuContent}</div>
                </DropdownMenu>
            </Dropdown>
        </div>
    )
}
