import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import Badge, {ColorType} from './Badge'

const storyConfig: Meta = {
    title: 'Data Display/Badge',
    component: Badge,
    parameters: {
        docs: {
            description: {
                component:
                    'Badge displays short and essential information. It is often used with multiple occurrences',
            },
        },
        backgrounds: {default: 'grey'},
    },
    argTypes: {
        type: {
            description: 'Preset color for background and text',
        },
    },
}

const Template: Story<ComponentProps<typeof Badge>> = (props) => (
    <Badge {...props} />
)

const BadgesTemplate: Story<ComponentProps<typeof Badge>> = (props) => (
    <>
        <Badge {...props} type={ColorType.Modern}>
            pineapple
        </Badge>
        <Badge {...props} type={ColorType.Indigo}>
            papaya
        </Badge>
        <Badge {...props} type={ColorType.Success}>
            guava
        </Badge>
        <Badge {...props} type={ColorType.Error}>
            carambola
        </Badge>
    </>
)

const templateParameters = {
    controls: {
        include: ['children', 'style', 'type'],
    },
}

const defaultProps: ComponentProps<typeof Badge> = {
    children: 'Hello there',
}
export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export const WithIcon = Template.bind({})
WithIcon.args = {
    ...defaultProps,
    children: (
        <>
            <i className="material-icons">warning</i>
            <div className="mx-1">This action is irreversible</div>
            <i className="material-icons">warning</i>
        </>
    ),
}
WithIcon.parameters = templateParameters

export const MultipleBadges = BadgesTemplate.bind({})
MultipleBadges.args = defaultProps
MultipleBadges.parameters = templateParameters

export default storyConfig
