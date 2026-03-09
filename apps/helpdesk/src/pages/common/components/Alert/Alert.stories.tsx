import type { ComponentProps } from 'react'

import { Button } from 'reactstrap'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import gorgiasLogo from '@gorgias/branding-assets/favicons/favicon-white.png'

import Alert from './Alert'

const storyConfig: Meta = {
    title: 'Feedback/Alert',
    component: Alert,
    globals: {
        backgrounds: {
            value: 'grey',
        },
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Alert component for displaying contextual feedback.',
            },
        },
    },
    argTypes: {
        type: {
            control: {
                type: 'select',
            },
        },
        customActions: {
            description: 'Custom JSX you want to use as actions.',
        },
        icon: {
            description:
                'Precise whether you want to show the default icon or not. You can also pass custom JSX you want to use as the icon.',
            control: 'boolean',
        },
    },
}

const parameters = {
    controls: {
        include: ['customActions', 'icon', 'type'],
    },
}

const Template: StoryFn<ComponentProps<typeof Alert>> = (props) => (
    <Alert {...props} />
)

const defaultProps: ComponentProps<typeof Alert> = {
    children: 'This is an alert !',
}
export const Info = Template.bind({})
Info.args = { ...defaultProps }
Info.parameters = parameters

export const WithIcon = Template.bind({})
WithIcon.args = { ...defaultProps, icon: true }

export const WithCustomIcon = Template.bind({})
WithCustomIcon.args = {
    ...defaultProps,
    icon: <img src={gorgiasLogo} alt="custom-icon" />,
}

export const Closable = Template.bind({})
Closable.args = { ...defaultProps }
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

export const CustomActionsWithOverflow = Template.bind({})
CustomActionsWithOverflow.args = {
    ...defaultProps,
    children:
        'Ullamco ullamco laboris magna incididunt eiusmod aute adipisicing laborum aliquip. Velit nisi officia nulla proident. Irure magna enim id adipisicing est sunt aliquip. Anim ex incididunt tempor duis nulla nisi nostrud ullamco elit. Officia occaecat exercitation est deserunt non excepteur cupidatat ex. Excepteur Lorem ex Lorem incididunt pariatur ut officia. Nostrud sit id proident pariatur consequat excepteur eu proident ea. Magna ad aute eiusmod non nisi quis esse consequat aliquip laborum elit.',
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
