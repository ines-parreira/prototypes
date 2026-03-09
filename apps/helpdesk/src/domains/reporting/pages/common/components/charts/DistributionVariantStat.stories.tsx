import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import DistributionVariantStat, {
    DistributionStatVariant,
} from 'domains/reporting/pages/common/components/charts/DistributionVariantStat'

const storyConfig: Meta = {
    title: 'Stats/DistributionVariantStat',
    component: DistributionVariantStat,
}

type Story = StoryObj<typeof DistributionVariantStat>

const Template: Story = {
    render: (props) => (
        <div style={{ height: '250px' }}>
            <DistributionVariantStat {...props} />
        </div>
    ),
}

const defaultProps: ComponentProps<typeof DistributionVariantStat> = {
    minValue: 0,
    maxValue: 5,
    variant: DistributionStatVariant.Default,
    currentValue: 3,
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export const Star = {
    ...Template,
    args: { ...defaultProps, variant: DistributionStatVariant.Star },
}

export default storyConfig
