import { ReactNode, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useId } from '@repo/hooks'
import classnames from 'classnames'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { useFlag } from 'core/flags'

import { Messages } from './constants'

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
    const id = useId()
    const scopedWithMessageTranslationId = `intent-feedback-dropdown-with-message-translation-${id}`
    const hasMessageTranslation = useFlag(FeatureFlagKey.MessagesTranslations)
    const tooltipContainer = `intent-tooltip-${messageId}`

    const [isOpen, setOpen] = useState(false)

    const _setOpen = (newState: boolean) => {
        onToggle(newState)
        setOpen(newState)
    }

    const dropdownMenuContent = (
        <>
            <div
                id={tooltipContainer}
                className={classnames(css.header, {
                    [css.hasMessageTranslation]: hasMessageTranslation,
                })}
            >
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
                    innerProps={{
                        fade: false,
                    }}
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
        <div
            className={classnames(css.wrapper, {
                [css.hasMessageTranslation]: hasMessageTranslation,
            })}
        >
            <Dropdown
                toggle={() => _setOpen(!isOpen)}
                isOpen={isOpen}
                onMouseLeave={() => _setOpen(false)}
            >
                <DropdownToggle
                    id={
                        hasMessageTranslation
                            ? scopedWithMessageTranslationId
                            : undefined
                    }
                    className={classnames(css.toggleMenu, {
                        [css.hasMessageTranslation]: hasMessageTranslation,
                    })}
                >
                    {hasMessageTranslation ? (
                        <>
                            <i className="material-icons">topic</i>
                            <Tooltip
                                target={scopedWithMessageTranslationId}
                                boundariesElement="viewport"
                                placement="bottom"
                                offset="0, 8"
                            >
                                <span>Message intent: {label}</span>
                            </Tooltip>
                        </>
                    ) : (
                        <>
                            <span className={classnames('mr-1', css.menuLabel)}>
                                {label}
                            </span>
                            <span
                                className={classnames(
                                    css.caret,
                                    'material-icons',
                                )}
                            >
                                arrow_drop_down
                            </span>
                        </>
                    )}
                </DropdownToggle>
                <DropdownMenu
                    className={classnames(css.menuWrapper, {
                        [css.hasMessageTranslation]: hasMessageTranslation,
                    })}
                    right
                >
                    <div
                        className={classnames(css.menu, {
                            [css.hasMessageTranslation]: hasMessageTranslation,
                        })}
                    >
                        {dropdownMenuContent}
                    </div>
                </DropdownMenu>
            </Dropdown>
        </div>
    )
}
