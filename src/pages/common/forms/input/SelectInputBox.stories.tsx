import React, {ComponentProps, useRef, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'

import SelectInputBox, {SelectInputBoxContext} from './SelectInputBox'

const storyConfig: Meta = {
    title: 'Data Entry/Input/SelectInputBox',
    component: SelectInputBox,
}

const options = ['tacos', 'pizza', 'tacos pizza']

const Template: Story<ComponentProps<typeof SelectInputBox>> = (
    props: ComponentProps<typeof SelectInputBox>
) => {
    const [value, setValue] = useState(props.label)
    const [isOpen, setIsOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    return (
        <SelectInputBox
            {...props}
            floating={floatingRef}
            label={value}
            onToggle={setIsOpen}
            ref={targetRef}
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
                            {options.map((option) => (
                                <DropdownItem
                                    key={option}
                                    option={{label: option, value: option}}
                                    onClick={() => setValue(option)}
                                    shouldCloseOnSelect
                                />
                            ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}

const defaultProps: Partial<ComponentProps<typeof SelectInputBox>> = {
    autoFocus: false,
    children: <></>,
    className: '',
    hasError: false,
    isDisabled: false,
    label: '',
    onToggle: undefined,
    placeholder: 'Select an option',
    prefix: '',
}

export const Default = Template.bind({})
Default.args = defaultProps

export const WithIcon = Template.bind({})
WithIcon.args = {
    ...defaultProps,
    prefix: <i className="material-icons">add</i>,
    suffix: <i className="material-icons">close</i>,
}

export default storyConfig
