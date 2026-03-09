import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import colors from '@gorgias/design-tokens/tokens/colors'

import Legend from 'domains/reporting/pages/common/components/charts/Legend'

const storyConfig: Meta = {
    title: 'Stats/Legend',
    component: Legend,
}

type Story = StoryObj<typeof Legend>

const Template: Story = {
    render: (props) => <Legend {...props} />,
}

const defaultProps: ComponentProps<typeof Legend> = {
    items: [
        {
            label: 'Foo',
            color: colors.classic.main.variations.primary_3.value,
        },
        {
            label: 'Bar',
            color: colors.classic.feedback.variations.error_3.value,
        },
        {
            label: 'Baz',
            color: colors.classic.feedback.variations.warning_3.value,
        },
        {
            label: 'Qux',
            color: colors.classic.accessory.purple_text.value,
        },
    ],
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export default storyConfig
