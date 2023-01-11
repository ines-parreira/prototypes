import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

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

const Template: Story<ComponentProps<typeof ShortcutIcon>> = ({
    children,
    ...props
}) => <ShortcutIcon {...props}>{children}</ShortcutIcon>

const templateParameters = {
    controls: {
        include: ['children', 'type'],
    },
}

const defaultProps: Partial<ComponentProps<typeof ShortcutIcon>> = {
    children: '⇧',
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig
