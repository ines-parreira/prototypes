import React, {ReactNode, useState} from 'react'
import {
    ButtonDropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'
import classnames from 'classnames'

import {TooltipWrapper} from './TooltipWrapper'
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
            <ButtonDropdown
                size="sm"
                toggle={() => toggle(!isOpen)}
                isOpen={isOpen}
                onMouseLeave={() => toggle(false)}
            >
                <DropdownToggle className={css.toggleMenu}>
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
                        <TooltipWrapper
                            id={`intent-info-${messageId}`}
                            tooltipContainer={tooltipContainer}
                            message={Messages.TOOLTIP_HEADER_INFO}
                        >
                            <i
                                className={classnames(
                                    'material-icons',
                                    'ml-2',
                                    css.info
                                )}
                            >
                                info_outline
                            </i>
                        </TooltipWrapper>
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
            </ButtonDropdown>
        </div>
    )
}
