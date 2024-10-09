import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import TrendBadge from 'pages/stats/TrendBadge'

const storyConfig: Meta = {
    title: 'Stats/TrendBadge',
    component: TrendBadge,
    argTypes: {
        type: {
            control: {
                type: 'select',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof TrendBadge>> = (props) => (
    <TrendBadge {...props} />
)

const defaultProps: ComponentProps<typeof TrendBadge> = {
    className: '',
    value: 0,
    prevValue: 0,
    interpretAs: 'more-is-better',
}

export const Neutral = Template.bind({})
Neutral.args = defaultProps

export const NoInterpretation = Template.bind({})
NoInterpretation.args = {
    ...defaultProps,
    value: 10,
    prevValue: 4,
    interpretAs: undefined,
}

export const PositiveBadge = Template.bind({})
PositiveBadge.args = {
    ...defaultProps,
    value: 2,
    prevValue: 1,
}

export const NegativeBadge = Template.bind({})
NegativeBadge.args = {
    ...defaultProps,
    value: 2,
    prevValue: 4,
}

export const BadgeWithTooltip = Template.bind({})
BadgeWithTooltip.args = {
    ...defaultProps,
    value: 15,
    prevValue: 8,
    tooltipData: {
        period: 'Feb 01, 2022 - Feb 05, 2022',
    },
}

export default storyConfig
