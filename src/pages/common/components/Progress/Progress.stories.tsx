import {ComponentProps} from 'react'
import {Meta, StoryObj} from '@storybook/react'

import Progress from './Progress'

const storyConfig: Meta<typeof Progress> = {
    title: 'General/Progress',
    component: Progress,
    argTypes: {
        barType: {
            control: {
                type: 'select',
                options: [
                    'primary',
                    'secondary',
                    'threshold',
                    'error',
                    'warning',
                    'success',
                ],
            },
        },
        labelType: {
            control: {
                type: 'select',
                options: ['percentage', 'fraction', 'none'],
            },
        },
        value: {
            control: {
                type: 'number',
            },
        },
        maxValue: {
            control: {
                type: 'number',
            },
        },
        thresholds: {
            control: {
                type: 'object',
            },
        },
    },
}

type Story = StoryObj<typeof Progress>

const templateParameters = {
    controls: {
        include: ['barType', 'labelType', 'value', 'maxValue', 'thresholds'],
    },
}

const defaultProps: ComponentProps<typeof Progress> = {
    barType: 'threshold',
    labelType: 'percentage',
    value: 70,
    maxValue: 100,
    thresholds: {
        success: {
            low: 61,
            high: 100,
        },
        warning: {
            low: 31,
            high: 60,
        },
        error: {
            low: 0,
            high: 30,
        },
        primary: {
            low: -1,
            high: -1,
        },
        secondary: {
            low: -1,
            high: -1,
        },
    },
}

/** Default progress bar */
export const Primary: Story = {
    args: {...defaultProps, barType: 'primary'},
    parameters: {
        ...templateParameters,
    },
}

/** Progress bar with different style */
export const Secondary: Story = {
    args: {
        ...defaultProps,
        barType: 'secondary',
        value: 25,
    },
    parameters: {
        ...templateParameters,
    },
}

/** Progress bar with thresholds. Default thresholds are 30 and 60 */
export const Tresholds: Story = {
    args: {
        ...defaultProps,
        barType: 'threshold',
        value: 25,
    },
    parameters: {
        ...templateParameters,
    },
}

/** Progress bar with reversed thresholds */
export const ReversedTresholds: Story = {
    args: {
        ...defaultProps,
        barType: 'threshold',
        value: 25,
        thresholds: {
            error: {
                low: 60,
                high: 100,
            },
            warning: {
                low: 30,
                high: 60,
            },
            success: {
                low: 0,
                high: 30,
            },
        },
    },
    parameters: {
        ...templateParameters,
    },
}

/** Showing original values instead of percents */
export const WithFractions: Story = {
    args: {
        ...defaultProps,
        barType: 'primary',
        labelType: 'fraction',
    },
    parameters: {
        ...templateParameters,
    },
}

/** Hiding the label */
export const HiddenValue: Story = {
    args: {
        ...defaultProps,
        barType: 'primary',
        labelType: 'none',
    },
    parameters: {
        ...templateParameters,
    },
}

export default storyConfig
