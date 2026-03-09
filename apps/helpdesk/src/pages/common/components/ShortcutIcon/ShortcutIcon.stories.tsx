import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import ShortcutIcon from './ShortcutIcon'

const storyConfig: Meta = {
    title: 'General/ShortcutIcon',
    component: ShortcutIcon,
    argTypes: {
        type: {
            control: {
                type: 'select',
            },
        },
    },
}

const Template: StoryObj<typeof ShortcutIcon> = {
    render: function Template({ children, ...props }) {
        return <ShortcutIcon {...props}>{children}</ShortcutIcon>
    },
}

const templateParameters = {
    controls: {
        include: ['children', 'type'],
    },
}

const defaultProps: Partial<ComponentProps<typeof ShortcutIcon>> = {
    children: '⇧',
}

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig
