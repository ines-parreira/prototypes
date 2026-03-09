import type { ComponentProps } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import Caption from './Caption'

const storyConfig: Meta = {
    title: 'Data Entry/Caption',
    component: Caption,
    argTypes: {
        children: {
            control: {
                type: 'select',
            },
            options: ['simple text', 'node'],
            mapping: {
                ['simple text']: 'More information on this checkbox',
                node: (
                    <>
                        <i className="material-icons">local_shipping</i> tutu
                    </>
                ),
            },
        },
        error: {
            control: {
                type: 'text',
            },
        },
    },
}

type TemplateProps = ComponentProps<typeof Caption>

const Template: StoryObj<TemplateProps> = {
    render: function Template({ ...props }) {
        return <Caption {...props} />
    },
}

const TemplateWithCustomStyle: StoryObj<TemplateProps> = {
    render: function TemplateWithCustomStyle({ children, ...props }) {
        return (
            <Caption
                {...props}
                style={{
                    color: '#f24f66',
                }}
            >
                {children}
            </Caption>
        )
    },
}

const defaultProps: Partial<ComponentProps<typeof Caption>> = {
    children: 'Name',
}

const templateParameters = {
    controls: {
        include: ['children', 'error', 'darken'],
    },
}

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export const CustomStyle = {
    ...TemplateWithCustomStyle,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig
