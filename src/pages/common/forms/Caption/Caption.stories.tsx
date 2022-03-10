import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

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

const Template: Story<ComponentProps<typeof Caption>> = (props) => (
    <Caption {...props} />
)

const TemplateWithCustomStyle: Story<ComponentProps<typeof Caption>> = ({
    children,
    ...props
}: ComponentProps<typeof Caption>) => (
    <Caption
        {...props}
        style={{
            color: '#f24f66',
        }}
    >
        {children}
    </Caption>
)

const defaultProps: Partial<ComponentProps<typeof Caption>> = {
    children: 'Name',
}

const templateParameters = {
    controls: {
        include: ['children', 'error'],
    },
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export const CustomStyle = TemplateWithCustomStyle.bind({})
CustomStyle.args = defaultProps
CustomStyle.parameters = templateParameters

export default storyConfig
