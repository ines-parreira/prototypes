import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import Legend from './Legend'

const storyConfig: Meta = {
    title: 'Stats/Legend',
    component: Legend,
}

const Template: Story<ComponentProps<typeof Legend>> = (props) => (
    <Legend {...props} />
)

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

export const Default = Template.bind({})
Default.args = defaultProps

export default storyConfig
