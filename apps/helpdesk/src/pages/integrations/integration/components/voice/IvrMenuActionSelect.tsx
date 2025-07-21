import React, { useCallback, useRef, useState } from 'react'

import {
    DEFAULT_IVR_DEFLECTION_CONFIRMATION_MESSAGE,
    IvrMenuActionType,
} from 'models/integration/constants'
import {
    IvrForwardCallMenuAction,
    IvrMenuAction,
} from 'models/integration/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './IvrMenuActionField.less'

const ACTION_NAMES: Record<IvrMenuActionType, string> = {
    [IvrMenuActionType.ForwardToExternalNumber]:
        'Forward call to external number',
    [IvrMenuActionType.ForwardToGorgiasNumber]:
        'Forward call to Gorgias number',
    [IvrMenuActionType.PlayMessage]: 'Play message',
    [IvrMenuActionType.SendToSms]: 'Send call to SMS',
}

type IvrMenuActionSelectProps = {
    onChange: (value: IvrMenuAction) => void
    value: IvrMenuAction
    hasSmsIntegrations: boolean
}

const IvrMenuActionSelect = ({
    onChange,
    value,
    hasSmsIntegrations,
}: IvrMenuActionSelectProps): JSX.Element => {
    const selectRef = useRef(null)
    const floatingSelectRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false)

    const actionOptions = Object.entries(ACTION_NAMES).map(([action, name]) => {
        const isOptionDisabled =
            action === IvrMenuActionType.SendToSms && !hasSmsIntegrations
        return {
            value: action,
            label: name,
            isDisabled: isOptionDisabled,
            tooltipText: isOptionDisabled
                ? 'Create integration to send calls to SMS.'
                : undefined,
        }
    })

    const handleActionTypeChange = useCallback(
        // TODO(React18): Find a solution to casting to any once we upgrade to React 18 types
        (action: any) => {
            switch (action) {
                case IvrMenuActionType.PlayMessage: {
                    onChange({
                        ...value,
                        action,
                    })
                    break
                }

                case IvrMenuActionType.ForwardToExternalNumber:
                case IvrMenuActionType.ForwardToGorgiasNumber: {
                    onChange({
                        ...value,
                        action,
                        forward_call: (value as IvrForwardCallMenuAction)
                            .forward_call ?? {
                            phone_number: '',
                        },
                    })
                    break
                }

                case IvrMenuActionType.SendToSms: {
                    onChange({
                        ...value,
                        action,
                        sms_deflection: {
                            confirmation_message:
                                DEFAULT_IVR_DEFLECTION_CONFIRMATION_MESSAGE,
                        },
                    })
                    break
                }
            }
        },
        [value, onChange],
    )

    return (
        <SelectInputBox
            onToggle={setIsOpen}
            label={ACTION_NAMES[value.action]}
            ref={selectRef}
            floating={floatingSelectRef}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isOpen={isOpen}
                        onToggle={() => context!.onBlur()}
                        ref={floatingSelectRef}
                        target={selectRef}
                        value={value.action}
                    >
                        <DropdownBody>
                            {actionOptions.map((option) => (
                                <div
                                    key={`wrapper-${option.value}`}
                                    id={`wrapper-${option.value}`}
                                    className={css.selectOptionWrapper}
                                >
                                    <DropdownItem
                                        key={option.value}
                                        option={option}
                                        onClick={() =>
                                            handleActionTypeChange(option.value)
                                        }
                                        isDisabled={option.isDisabled}
                                        shouldCloseOnSelect
                                    />
                                    {option.tooltipText && (
                                        <IconTooltip
                                            icon="info"
                                            tooltipProps={{
                                                autohide: false,
                                            }}
                                        >
                                            {option.tooltipText}
                                        </IconTooltip>
                                    )}
                                </div>
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}

export default IvrMenuActionSelect
