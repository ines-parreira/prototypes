import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'
import {Label} from '@gorgias/ui-kit'

import IconTooltip from './IconTooltip'

const storyConfig: Meta = {
    title: 'Data Entry/IconTooltip',
    component: IconTooltip,
}

const IconTooltipStory: Story<ComponentProps<typeof IconTooltip>> = ({
    children,
    ...props
}: ComponentProps<typeof Label>) => (
    <Label {...props}>
        Some label
        <IconTooltip {...props}>{children}</IconTooltip>
    </Label>
)

const defaultProps: ComponentProps<typeof Label> = {
    children: 'More information here',
}

const templateParameters = {
    controls: {
        include: ['children'],
    },
}

export const Default = IconTooltipStory.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig
