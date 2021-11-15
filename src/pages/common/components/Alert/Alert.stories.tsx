import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'
import {Button} from 'reactstrap'

import Alert from './Alert'

const storyConfig: Meta = {
    title: 'Feedback/Alert',
    component: Alert,
    parameters: {
        docs: {
            description: {
                component:
                    'Alert component for displaying contextual feedback.',
            },
        },
        backgrounds: {default: 'grey'},
    },
    argTypes: {
        type: {
            control: {
                type: 'select',
            },
        },
        customActions: {
            description: 'Custom JSX you want to use as actions.',
            control: {
                type: null,
            },
        },
    },
}

const Template: Story<ComponentProps<typeof Alert>> = (props) => (
    <Alert {...props} />
)

const defaultProps: ComponentProps<typeof Alert> = {
    children: 'This is an alert !',
}
export const Info = Template.bind({})
Info.args = {...defaultProps}

export const WithIcon = Template.bind({})
WithIcon.args = {...defaultProps, showIcon: true}

export const Closable = Template.bind({})
Closable.args = {...defaultProps}
Closable.argTypes = {
    onClose: {
        action: 'Closed !',
    },
}

export const CustomActions = Template.bind({})
CustomActions.args = {
    ...defaultProps,
    customActions: (
        <div>
            <Button type="button" color="primary" className="mr-3">
                Apply
            </Button>
            <Button type="button" color="secondary">
                Cancel
            </Button>
        </div>
    ),
}

export default storyConfig
