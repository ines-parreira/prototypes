import type { ComponentProps } from 'react'
import { useRef, useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { LegacyButton as Button } from '@gorgias/axiom'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownQuickSelect from 'pages/common/components/dropdown/DropdownQuickSelect'

import InputGroup from './InputGroup'
import NumberInput from './NumberInput'
import SelectInputBox, { SelectInputBoxContext } from './SelectInputBox'
import TextInput from './TextInput'

const storyConfig: Meta = {
    title: 'Data Entry/Input/InputGroup',
    component: InputGroup,
}

type Story = StoryObj<typeof InputGroup>

const WithNumberInputTemplate: Story = {
    render: function Template({ ...props }) {
        const [firstInputCount, setFirstInputCount] = useState<
            number | undefined
        >(0)
        const [secondInputCount, setSecondInputCount] = useState<
            number | undefined
        >(0)

        return (
            <InputGroup {...props}>
                <Button intent="secondary">Foo</Button>
                <NumberInput
                    hasControls={false}
                    onChange={setFirstInputCount}
                    value={firstInputCount}
                />
                <Button intent="secondary">Bar</Button>
                <NumberInput
                    onChange={setSecondInputCount}
                    value={secondInputCount}
                />
                <Button intent="secondary">Baz</Button>
            </InputGroup>
        )
    },
}

type WithSelectInputTemplateProps = ComponentProps<typeof InputGroup> & {
    options: string[]
}

const WithSelectInputTemplate: StoryObj<WithSelectInputTemplateProps> = {
    render: function Template({ options, ...other }) {
        const selectRef = useRef(null)
        const floatingSelectRef = useRef(null)
        const [isSelectOpen, setIsSelectOpen] = useState(false)
        const [value, setValue] = useState('')
        const multiSelectRef = useRef(null)
        const floatingMultiSelectRef = useRef(null)
        const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false)
        const [multiValue, setMultiValue] = useState<string[]>([])

        return (
            <InputGroup {...other}>
                <Button intent="secondary">Foo</Button>
                <SelectInputBox
                    floating={floatingSelectRef}
                    label={value}
                    onToggle={setIsSelectOpen}
                    ref={selectRef}
                >
                    <SelectInputBoxContext.Consumer>
                        {(context) => (
                            <Dropdown
                                isOpen={isSelectOpen}
                                onToggle={() => context!.onBlur()}
                                ref={floatingSelectRef}
                                target={selectRef}
                                value={value}
                            >
                                <DropdownBody>
                                    {options.map((option) => (
                                        <DropdownItem
                                            autoFocus
                                            key={option}
                                            option={{
                                                label: option,
                                                value: option,
                                            }}
                                            onClick={() => setValue(option)}
                                            shouldCloseOnSelect
                                        />
                                    ))}
                                </DropdownBody>
                            </Dropdown>
                        )}
                    </SelectInputBoxContext.Consumer>
                </SelectInputBox>
                <Button intent="secondary">Bar</Button>
                <SelectInputBox
                    floating={floatingMultiSelectRef}
                    id="baz"
                    label={multiValue}
                    onToggle={(value) => {
                        setIsMultiSelectOpen(value)
                    }}
                    ref={multiSelectRef}
                >
                    <SelectInputBoxContext.Consumer>
                        {(context) => (
                            <Dropdown
                                isMultiple
                                isOpen={isMultiSelectOpen}
                                onToggle={() => context!.onBlur()}
                                ref={floatingMultiSelectRef}
                                target={multiSelectRef}
                                value={multiValue}
                            >
                                <DropdownQuickSelect
                                    autoFocus
                                    count={options.length}
                                    onRemoveAll={() => setMultiValue([])}
                                    onSelectAll={() => setMultiValue(options)}
                                    values={options}
                                />
                                <DropdownBody>
                                    {options.map((option) => (
                                        <DropdownItem
                                            key={option}
                                            option={{
                                                label: option,
                                                value: option,
                                            }}
                                            onClick={() => {
                                                if (
                                                    multiValue.includes(option)
                                                ) {
                                                    setMultiValue(
                                                        multiValue.filter(
                                                            (item) =>
                                                                item !== option,
                                                        ),
                                                    )
                                                } else {
                                                    setMultiValue([
                                                        ...multiValue,
                                                        option,
                                                    ])
                                                }
                                            }}
                                        />
                                    ))}
                                </DropdownBody>
                            </Dropdown>
                        )}
                    </SelectInputBoxContext.Consumer>
                </SelectInputBox>
                <Button intent="secondary">Baz</Button>
            </InputGroup>
        )
    },
}

const WithTextInputTemplate: Story = {
    render: function Template({ ...props }) {
        const [firstTextInput, setFirstTextInput] = useState<string>('')
        const [secondTextInput, setSecondTextInput] = useState<string>('')

        return (
            <InputGroup {...props}>
                <Button intent="secondary">Foo</Button>
                <TextInput
                    onChange={setFirstTextInput}
                    value={firstTextInput}
                />
                <Button intent="secondary">Bar</Button>
                <TextInput
                    onChange={setSecondTextInput}
                    value={secondTextInput}
                />
                <Button intent="secondary">Baz</Button>
            </InputGroup>
        )
    },
}

export const WithNumberInput = WithNumberInputTemplate

export const WithSelectInput = {
    ...WithSelectInputTemplate,
    args: {
        options: [
            'pizza',
            'tacos',
            'sushis',
            'ice-cream',
            'burger',
            'fries',
            'salad',
            'poke bowl',
        ],
    },
}

export const WithTextInput = WithTextInputTemplate

export default storyConfig
