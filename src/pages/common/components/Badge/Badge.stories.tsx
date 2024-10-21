import {Meta, StoryFn} from '@storybook/react'
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
        corner: {
            description: 'Corner style',
            control: {
                type: 'select',
            },
            options: ['round', 'square'],
        },
    },
}

const Template: StoryFn<ComponentProps<typeof Badge>> = (props) => (
    <Badge {...props} />
)

const BadgesTemplate: StoryFn<ComponentProps<typeof Badge>> = (props) => (
    <div
        style={{
            display: 'flex',
            gap: 4,
        }}
    >
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
    </div>
)

const templateParameters = {
    controls: {
        include: ['children', 'style', 'type', 'corner'],
    },
}

const defaultProps: ComponentProps<typeof Badge> = {
    children: 'Hello there',
}
export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

const AvailableTypes: StoryFn<ComponentProps<typeof Badge>> = (props) => (
    <div
        style={{
            display: 'flex',
            gap: 4,
        }}
    >
        {Object.values(ColorType).map((type) => (
            <Badge key={type} type={type} {...props}>
                {type}
            </Badge>
        ))}
    </div>
)
export const AllTypes = AvailableTypes.bind({})

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
