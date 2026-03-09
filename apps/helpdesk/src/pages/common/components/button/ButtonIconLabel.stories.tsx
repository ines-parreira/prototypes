import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Button } from '@gorgias/axiom'

import ButtonIconLabel from './ButtonIconLabel'

const storyConfig: Meta = {
    title: 'General/Button/ButtonIconLabel',
    component: ButtonIconLabel,
    argTypes: {
        position: {
            control: {
                type: 'select',
            },
        },
    },
}

const Template: StoryObj<typeof ButtonIconLabel> = {
    render: function Template(props) {
        return <ButtonIconLabel {...props} />
    },
}

const UsageTemplate: StoryObj<typeof ButtonIconLabel> = {
    render: function UsageTemplate(props) {
        return (
            <Button>
                <ButtonIconLabel {...props} />
            </Button>
        )
    },
}

const defaultProps: ComponentProps<typeof ButtonIconLabel> = {
    children: 'Click me!',
    icon: 'calendar_today',
    position: 'left',
}

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: {
        controls: {
            exclude: ['className'],
        },
    },
}

export const Usage = {
    ...UsageTemplate,
    args: defaultProps,
    parameters: {
        controls: {
            exclude: ['className'],
        },
    },
}

export default storyConfig
