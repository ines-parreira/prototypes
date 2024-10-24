import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import DistributionVariantStat, {
    DistributionStatVariant,
} from './DistributionVariantStat'

const storyConfig: Meta = {
    title: 'Stats/DistributionVariantStat',
    component: DistributionVariantStat,
}

const Template: Story<ComponentProps<typeof DistributionVariantStat>> = (
    props
) => (
    <div style={{height: '250px'}}>
        <DistributionVariantStat {...props} />
    </div>
)

const defaultProps: ComponentProps<typeof DistributionVariantStat> = {
    minValue: 0,
    maxValue: 5,
    variant: DistributionStatVariant.Default,
    currentValue: 3,
}

export const Default = Template.bind({})
Default.args = defaultProps
export const Star = Template.bind({})
Star.args = {...defaultProps, variant: DistributionStatVariant.Star}

export default storyConfig
