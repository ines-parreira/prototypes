import type { ComponentProps } from 'react'
import type React from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { SteppedSlider } from './SteppedSlider'

const storyConfig: Meta<typeof SteppedSlider> = {
    title: 'General/SteppedSlider',
    component: SteppedSlider,
    argTypes: {
        steps: {
            control: {
                type: 'object',
            },
        },
        stepKey: {
            control: {
                type: 'text',
            },
        },
        color: {
            control: {
                type: 'color',
            },
        },
        backgroundColor: {
            control: {
                type: 'color',
            },
        },
        onChange: { action: 'onChange' },
    },
    parameters: {
        layout: 'centered',
    },
}

type Story = StoryObj<typeof SteppedSlider>

const templateParameters = {
    controls: {
        include: ['steps', 'stepKey', 'color', 'backgroundColor'],
    },
}

const defaultSteps = [
    { key: 'start', label: 'Start' },
    { key: 'step2', label: 'Step 2' },
    { key: 'step3', label: 'Step 3' },
    { key: 'step4', label: 'Step 4' },
    { key: 'finish', label: 'Finish' },
]

const defaultProps: ComponentProps<typeof SteppedSlider> = {
    steps: defaultSteps,
    stepKey: 'start',
    color: '#C34CED',
    backgroundColor: 'var(--accessory-magenta-2)',
    onChange: () => {},
}

const SliderWithState = ({
    initialValue = 'start',
    ...args
}: {
    initialValue?: string
} & Partial<React.ComponentProps<typeof SteppedSlider>>) => {
    const [stepKey, setStepKey] = useState(initialValue)
    return (
        <SteppedSlider
            {...defaultProps}
            {...args}
            stepKey={stepKey}
            onChange={setStepKey}
        />
    )
}

/** Default onboarding stepped slider */
export const DefaultSteppedSlider: Story = {
    render: (args) => (
        <div style={{ width: '400px' }}>
            <SliderWithState {...args} />
        </div>
    ),
    args: { ...defaultProps },
    parameters: {
        ...templateParameters,
    },
}

/** Custom initial value */
export const CustomInitialValue: Story = {
    render: () => (
        <div style={{ width: '400px' }}>
            <SliderWithState initialValue="step4" />
        </div>
    ),
}

/** Different widths */
export const DifferentWidths: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ width: '200px' }}>
                <SliderWithState />
            </div>
            <div style={{ width: '400px' }}>
                <SliderWithState />
            </div>
            <div style={{ width: '600px' }}>
                <SliderWithState />
            </div>
        </div>
    ),
}

export default storyConfig
