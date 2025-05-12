import type { ComponentProps } from 'react'

import { Meta, StoryObj } from '@storybook/react'

import colors from '@gorgias/design-tokens/dist/tokens/colors.json'

import Legend from './Legend'

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
            color: colors['📺 Classic'].Main.Variations.Primary_3.value,
        },
        {
            label: 'Bar',
            color: colors['📺 Classic'].Feedback.Variations.Error_3.value,
        },
        {
            label: 'Baz',
            color: colors['📺 Classic'].Feedback.Variations.Warning_3.value,
        },
        {
            label: 'Qux',
            color: colors['📺 Classic'].Accessory.Purple_text.value,
        },
    ],
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export default storyConfig
