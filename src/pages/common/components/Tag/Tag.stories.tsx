import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import Tag from './Tag'

const storyConfig: Meta = {
    title: 'General/Tag',
    component: Tag,
    parameters: {
        backgrounds: {default: 'grey'},
    },
    argTypes: {
        color: {
            description: 'Color of the tag.',
            control: {
                type: 'select',
                options: [
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
                ],
            },
        },
        text: {
            description: 'Text to display in the tag.',
            control: {type: 'text'},
        },
        leadIcon: {
            description: 'Icon to display before the text.',
            control: {type: null},
        },
        trailIcon: {
            description: 'Icon to display after the text.',
            control: {type: null},
        },
        className: {control: {type: null}},
    },
}

const defaultProps: Pick<ComponentProps<typeof Tag>, 'text'> = {
    text: 'Tag',
}

const Template: Story<ComponentProps<typeof Tag>> = (args) => <Tag {...args} />

export const DefaultTag = Template.bind({})
DefaultTag.args = {...defaultProps}

export const IconOnlyTag = Template.bind({})
IconOnlyTag.args = {
    ...defaultProps,
    text: undefined,
    leadIcon: <i className="material-icons">add</i>,
}

export const LeadIconTag = Template.bind({})
LeadIconTag.args = {
    ...defaultProps,
    text: 'Add',
    leadIcon: <i className="material-icons">add</i>,
}

export const TrailIconTag = Template.bind({})
TrailIconTag.args = {
    ...defaultProps,
    text: 'Remove',
    trailIcon: <i className="material-icons">close</i>,
}

export default storyConfig
