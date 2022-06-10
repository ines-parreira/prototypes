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
}: {
    label: string
    messageId: number
    onToggle: (state: boolean) => void
    activeIntentsNames: string[]
    availableIntentsNames: string[]
    renderAvailableIntent: (intent: string) => ReactNode
    renderActiveIntent: (intent: string) => ReactNode
}) => {
    const [isOpen, setOpen] = useState(false)
    const tooltipContainer = `intent-tooltip-${messageId}`

    const toggle = (newState: boolean) => {
        onToggle(newState)
        setOpen(newState)
    }

    return (
        <div className={css.wrapper}>
            <div id={tooltipContainer} />
            <Dropdown
                toggle={() => toggle(!isOpen)}
                isOpen={isOpen}
                onMouseLeave={() => toggle(false)}
            >
                <DropdownToggle className={classnames(css.toggleMenu)}>
                    <span className={classnames('mr-1', css.menuLabel)}>
                        {label}
                    </span>
                    <span className={classnames(css.caret, 'material-icons')}>
                        arrow_drop_down
                    </span>
                </DropdownToggle>
                <DropdownMenu className={css.menu} right>
                    <div className={classnames(css.header)}>
                        Message intents
                        <i
                            className={classnames(
                                'material-icons',
                                'ml-2',
                                css.info
                            )}
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
                        <DropdownItem
                            className={classnames(css.subheader)}
                            header
                        >
                            {label}
                        </DropdownItem>
                        {activeIntentsNames.map(renderActiveIntent)}
                        <DropdownItem divider />
                        {
                            <DropdownItem
                                className={classnames(css.subheader)}
                                header
                            >
                                Other intents
                            </DropdownItem>
                        }
                        {availableIntentsNames.map(renderAvailableIntent)}
                    </div>
                </DropdownMenu>
            </Dropdown>
        </div>
    )
}
