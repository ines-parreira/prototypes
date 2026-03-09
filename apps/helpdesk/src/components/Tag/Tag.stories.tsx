import type { ComponentProps } from 'react'

import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { Tag } from './Tag'

const colors = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'gray',
    'pink',
    'purple',
    'orange',
    'teal',
]

const storyConfig: Meta = {
    title: 'General/Tag',
    component: Tag,
    globals: {
        backgrounds: {
            value: 'grey',
        },
    },
    argTypes: {
        color: {
            description: 'Color of the tag.',
            control: { type: 'select' },
            options: colors,
        },
        text: {
            description: 'Text to display in the tag.',
            control: { type: 'text' },
        },
        trailIcon: {
            description: 'Icon to display after the text.',
        },
        className: { control: { type: 'text' } },
    },
}

const defaultProps: ComponentProps<typeof Tag> = {
    text: 'Tag',
}

const Template: StoryFn<ComponentProps<typeof Tag>> = (args) => {
    return (
        <div
            style={{
                display: 'flex',
                gap: '4px',
            }}
        >
            {colors.map((color) => (
                <Tag key={color} {...args} color={color} />
            ))}
        </div>
    )
}

export const DefaultTag = Template.bind({})

DefaultTag.args = { ...defaultProps }

export const IconOnlyTag = Template.bind({})
IconOnlyTag.args = {
    ...defaultProps,
    text: undefined,
    trailIcon: <i className="material-icons">add</i>,
}

export const TrailIconTag = Template.bind({})
TrailIconTag.args = {
    ...defaultProps,
    text: 'Close',
    trailIcon: <i className="material-icons">close</i>,
}

export default storyConfig
