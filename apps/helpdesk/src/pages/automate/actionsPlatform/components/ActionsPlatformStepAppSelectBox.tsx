import React, { useCallback, useRef, useState } from 'react'

import { Label } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/constants'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import useGetAppFromTemplateApp from '../hooks/useGetAppFromTemplateApp'
import { ActionTemplateApp, App } from '../types'

import css from './ActionsPlatformAppSelectBox.less'

type Props = {
    apps: App[]
    value: ActionTemplateApp | undefined
    onChange: (value: ActionTemplateApp) => void
    isDisabled?: boolean
}

const ActionsPlatformStepAppSelectBox = ({
    apps,
    value,
    onChange,
    isDisabled,
}: Props) => {
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const [isOpen, setIsOpen] = useState(false)

    const getAppFromTemplateApp = useGetAppFromTemplateApp({ apps })

    const appValue = value ? getAppFromTemplateApp(value) : null

    const handleClick = useCallback(
        (app: App) => {
            switch (app.type) {
                case IntegrationType.App:
                    onChange({
                        app_id: app.id,
                        type: app.type,
                    })

                    break
                default:
                    onChange({ type: app.type })
            }
        },
        [onChange],
    )

    return (
        <div className={css.container}>
            <Label isRequired>App</Label>
            <SelectInputBox
                placeholder="Select App"
                floating={floatingRef}
                ref={targetRef}
                onToggle={setIsOpen}
                label={appValue?.name}
                isDisabled={isDisabled}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={appValue?.id}
                        >
                            <DropdownSearch autoFocus />
                            <DropdownBody>
                                {apps.map((app) => (
                                    <DropdownItem
                                        key={app.id}
                                        option={{
                                            value: app.id,
                                            label: app.name,
                                        }}
                                        onClick={() => {
                                            handleClick(app)
                                        }}
                                        shouldCloseOnSelect
                                    >
                                        <img
                                            src={app.icon}
                                            alt={app.name}
                                            className={css.icon}
                                            title={app.name}
                                        />
                                        <span className={css.name}>
                                            {app.name}
                                        </span>
                                    </DropdownItem>
                                ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        </div>
    )
}

export default ActionsPlatformStepAppSelectBox
