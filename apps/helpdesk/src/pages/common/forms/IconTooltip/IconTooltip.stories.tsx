import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { LegacyLabel as Label } from '@gorgias/axiom'

import IconTooltip from './IconTooltip'

const storyConfig: Meta = {
    title: 'Data Entry/IconTooltip',
    component: IconTooltip,
}

type IconTooltipStoryProps = ComponentProps<typeof IconTooltip>

const IconTooltipStory: StoryObj<IconTooltipStoryProps> = {
    render: function Template({ children, ...props }) {
        return (
            <Label {...props}>
                Some label
                <IconTooltip {...props}>{children}</IconTooltip>
            </Label>
        )
    },
}

const defaultProps: ComponentProps<typeof Label> = {
    children: 'More information here',
}

const templateParameters = {
    controls: {
        include: ['children'],
    },
}

export const Default = {
    ...IconTooltipStory,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig
