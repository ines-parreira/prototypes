import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'
import {Button} from 'reactstrap'

import gorgiasLogo from '../../../../../../public/img/gorgias-light-icon-48.png'

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
        icon: {
            description:
                'Precise whether you want to show the default icon or not. You can also pass custom JSX you want to use as the icon.',
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
WithIcon.args = {...defaultProps, icon: true}

export const WithCustomIcon = Template.bind({})
WithCustomIcon.args = {
    ...defaultProps,
    icon: <img src={gorgiasLogo} alt="custom-icon" />,
}

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
