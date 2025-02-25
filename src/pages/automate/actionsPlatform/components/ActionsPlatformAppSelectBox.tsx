import React, { useRef, useState } from 'react'

import { Label } from '@gorgias/merchant-ui-kit'

import { IntegrationType } from 'models/integration/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import { App } from '../types'

import css from './ActionsPlatformAppSelectBox.less'

type Props = {
    apps: Extract<App, { type: IntegrationType.App }>[]
    value?: App['id']
    onChange: (value: App['id']) => void
    isDisabled?: boolean
}

const ActionsPlatformAppSelectBox = ({
    apps,
    value,
    onChange,
    isDisabled,
}: Props) => {
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const [isOpen, setIsOpen] = useState(false)

    const label = apps.find((app) => app.id === value)?.name

    return (
        <div className={css.container}>
            <Label isRequired>App</Label>
            <SelectInputBox
                placeholder="Select an App"
                floating={floatingRef}
                ref={targetRef}
                onToggle={setIsOpen}
                isDisabled={isDisabled}
                label={label}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={value}
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
                                        onClick={onChange}
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

export default ActionsPlatformAppSelectBox
