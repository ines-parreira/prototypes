import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge/index'

const storyConfig: Meta<typeof TrendBadge> = {
    title: 'Stats/TrendBadge',
    component: TrendBadge,
    argTypes: {
        interpretAs: {
            control: {
                type: 'select',
            },
        },
    },
}

type Story = StoryObj<typeof TrendBadge>

const Template: Story = {
    render: (props) => <TrendBadge {...props} />,
}

const defaultProps: ComponentProps<typeof TrendBadge> = {
    className: '',
    value: 0,
    prevValue: 0,
    interpretAs: 'more-is-better',
}

export const Neutral = {
    ...Template,
    args: defaultProps,
}

export const NoInterpretation = {
    ...Template,
    args: {
        ...defaultProps,
        value: 10,
        prevValue: 4,
        interpretAs: undefined,
    },
}

export const PositiveBadge = {
    ...Template,
    args: {
        ...defaultProps,
        value: 2,
        prevValue: 1,
    },
}

export const NegativeBadge = {
    ...Template,
    args: {
        ...defaultProps,
        value: 2,
        prevValue: 4,
    },
}

export const BadgeWithTooltip = {
    ...Template,
    args: {
        ...defaultProps,
        value: 15,
        prevValue: 8,
        tooltipData: {
            period: 'Feb 01, 2022 - Feb 05, 2022',
        },
    },
}

export default storyConfig
