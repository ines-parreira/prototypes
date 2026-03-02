import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import { EmojiPicker } from './EmojiPicker'
import type { EmojiPickerProps } from './EmojiPicker'

const meta: Meta<typeof EmojiPicker> = {
    title: 'Components/EmojiPicker',
    component: EmojiPicker,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <div style={{ width: '400px', padding: '20px' }}>
                <Story />
            </div>
        ),
    ],
    argTypes: {
        value: {
            description: 'Current value of the text field',
            control: 'text',
        },
        onChange: {
            description: 'Callback when the text field value changes',
            action: 'changed',
        },
        onValidationChange: {
            description: 'Callback when validation state changes',
            action: 'validation-changed',
        },
        label: {
            description: 'Label text displayed above the field',
            control: 'text',
        },
        placeholder: {
            description: 'Placeholder text for the input',
            control: 'text',
        },
        isDisabled: {
            description: 'Whether the field is disabled',
            control: 'boolean',
        },
        isRequired: {
            description: 'Whether the field is required',
            control: 'boolean',
        },
        error: {
            description: 'Error message to display',
            control: 'text',
        },
        caption: {
            description: 'Caption text displayed below the field',
            control: 'text',
        },
        'aria-label': {
            description: 'Accessible label for screen readers',
            control: 'text',
        },
    },
}

export default meta
type Story = StoryObj<typeof EmojiPicker>

function DefaultStory(args: EmojiPickerProps) {
    const [value, setValue] = useState('')

    return (
        <EmojiPicker
            {...args}
            value={value}
            onChange={(newValue) => {
                setValue(newValue)
                args.onChange?.(newValue)
            }}
        />
    )
}

export const Default: Story = {
    render: DefaultStory,
    args: {
        placeholder: 'Type or select emojis',
    },
}

function WithLabelStory(args: EmojiPickerProps) {
    const [value, setValue] = useState('')

    return (
        <EmojiPicker
            {...args}
            value={value}
            onChange={(newValue) => {
                setValue(newValue)
                args.onChange?.(newValue)
            }}
        />
    )
}

export const WithLabel: Story = {
    render: WithLabelStory,
    args: {
        label: 'Allowed emojis',
        placeholder: 'Type or select emojis',
    },
}

function WithInitialValueStory(args: EmojiPickerProps) {
    const [value, setValue] = useState('😀 😃 😄')

    return (
        <EmojiPicker
            {...args}
            value={value}
            onChange={(newValue) => {
                setValue(newValue)
                args.onChange?.(newValue)
            }}
        />
    )
}

export const WithInitialValue: Story = {
    render: WithInitialValueStory,
    args: {
        label: 'Allowed emojis',
    },
}

function WithValidationStory(args: EmojiPickerProps) {
    const [value, setValue] = useState('')
    const [isValid, setIsValid] = useState(true)

    return (
        <div>
            <EmojiPicker
                {...args}
                value={value}
                onChange={(newValue) => {
                    setValue(newValue)
                    args.onChange?.(newValue)
                }}
                onValidationChange={(valid) => {
                    setIsValid(valid)
                    args.onValidationChange?.(valid)
                }}
            />
            <p style={{ marginTop: '10px', fontSize: '12px' }}>
                Validation status: {isValid ? '✓ Valid' : '✗ Invalid'}
            </p>
        </div>
    )
}

export const WithValidation: Story = {
    render: WithValidationStory,
    args: {
        label: 'Allowed emojis',
        placeholder: 'Try typing text or emojis',
        caption: 'Only emojis are allowed in this field',
    },
}

function RequiredStory(args: EmojiPickerProps) {
    const [value, setValue] = useState('')

    return (
        <EmojiPicker
            {...args}
            value={value}
            onChange={(newValue) => {
                setValue(newValue)
                args.onChange?.(newValue)
            }}
        />
    )
}

export const Required: Story = {
    render: RequiredStory,
    args: {
        label: 'Allowed emojis',
        placeholder: 'Type or select emojis',
        isRequired: true,
    },
}

function WithErrorStory(args: EmojiPickerProps) {
    const [value, setValue] = useState('')

    return (
        <EmojiPicker
            {...args}
            value={value}
            onChange={(newValue) => {
                setValue(newValue)
                args.onChange?.(newValue)
            }}
        />
    )
}

export const WithError: Story = {
    render: WithErrorStory,
    args: {
        label: 'Allowed emojis',
        placeholder: 'Type or select emojis',
        error: 'At least one emoji is required',
    },
}

function WithCaptionStory(args: EmojiPickerProps) {
    const [value, setValue] = useState('')

    return (
        <EmojiPicker
            {...args}
            value={value}
            onChange={(newValue) => {
                setValue(newValue)
                args.onChange?.(newValue)
            }}
        />
    )
}

export const WithCaption: Story = {
    render: WithCaptionStory,
    args: {
        label: 'Allowed emojis',
        placeholder: 'Type or select emojis',
        caption: 'Click the emoji icon to open the picker',
    },
}

function DisabledStory(args: EmojiPickerProps) {
    const [value, setValue] = useState('😀 😃 😄')

    return (
        <EmojiPicker
            {...args}
            value={value}
            onChange={(newValue) => {
                setValue(newValue)
                args.onChange?.(newValue)
            }}
        />
    )
}

export const Disabled: Story = {
    render: DisabledStory,
    args: {
        label: 'Allowed emojis',
        isDisabled: true,
    },
}

function WithLabelNoPlaceholderStory(args: EmojiPickerProps) {
    const [value, setValue] = useState('')

    return (
        <EmojiPicker
            {...args}
            value={value}
            onChange={(newValue) => {
                setValue(newValue)
                args.onChange?.(newValue)
            }}
        />
    )
}

export const WithLabelNoPlaceholder: Story = {
    render: WithLabelNoPlaceholderStory,
    args: {
        label: 'Select emojis',
    },
}
