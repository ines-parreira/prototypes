import React, {ReactNode, useState} from 'react'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'
import classnames from 'classnames'

import css from './IntentsFeedbackDropdown.less'

export const IntentsFeedbackDropdown = ({
    label,
    onToggle,
    activeIntentsNames,
    renderActiveIntent,
    renderContentOnly,
    onContentMouseLeave,
    onBack,
}: {
    label: string
    onToggle: (state: boolean) => void
    activeIntentsNames: string[]
    renderActiveIntent: (intent: string) => ReactNode
    renderContentOnly?: boolean
    onContentMouseLeave?: () => void
    onBack?: () => void
}) => {
    const [isOpen, setOpen] = useState(false)

    const _setOpen = (newState: boolean) => {
        onToggle(newState)
        setOpen(newState)
    }

    const dropdownMenuContent = (
        <>
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
            </div>
            <div className={css.options}>
                <DropdownItem className={classnames(css.subheader)} header>
                    {label}
                </DropdownItem>
                {activeIntentsNames.map(renderActiveIntent)}
            </div>
        </>
    )

    if (renderContentOnly)
        return (
            <div
                onMouseLeave={() =>
                    onContentMouseLeave && onContentMouseLeave()
                }
            >
                {dropdownMenuContent}
            </div>
        )

    return (
        <div className={css.wrapper}>
            {activeIntentsNames.length ? (
                <Dropdown
                    toggle={() => _setOpen(!isOpen)}
                    isOpen={isOpen}
                    onMouseLeave={() => _setOpen(false)}
                >
                    <DropdownToggle className={css.toggleMenu}>
                        <span className={classnames('mr-1', css.menuLabel)}>
                            {label}
                        </span>
                        <span
                            className={classnames(css.caret, 'material-icons')}
                        >
                            arrow_drop_down
                        </span>
                    </DropdownToggle>
                    <DropdownMenu className={css.menu} right>
                        {dropdownMenuContent}
                    </DropdownMenu>
                </Dropdown>
            ) : (
                <button
                    className={classnames(
                        css.toggleMenu,
                        'btn btn-secondary btn-frozen pe-none'
                    )}
                >
                    {label}
                </button>
            )}
        </div>
    )
}
