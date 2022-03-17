import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import Label from './Label'
import IconTooltip from './IconTooltip'

const storyConfig: Meta = {
    title: 'Data Entry/Label',
    component: Label,
    argTypes: {
        isDisabled: {
            control: {
                type: 'boolean',
            },
        },
        isRequired: {
            control: {
                type: 'boolean',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof Label>> = (props) => (
    <Label {...props} />
)

const TemplateWithIcon: Story<ComponentProps<typeof Label>> = ({
    children,
    ...props
}: ComponentProps<typeof Label>) => (
    <Label {...props}>
        {children}
        <i className="material-icons" style={{marginLeft: '4px'}}>
            info_outline
        </i>
    </Label>
)

const TemplateWithIconTooltip: Story<ComponentProps<typeof Label>> = ({
    children,
    ...props
}: ComponentProps<typeof Label>) => (
    <Label {...props}>
        {children}
        <IconTooltip>More information here</IconTooltip>
    </Label>
)

const defaultProps: ComponentProps<typeof Label> = {
    children: 'Name',
}

const templateParameters = {
    controls: {
        include: ['children', 'isDisabled', 'isRequired'],
    },
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export const WithIcon = TemplateWithIcon.bind({})
WithIcon.args = defaultProps
WithIcon.parameters = templateParameters

export const WithIconTooltip = TemplateWithIconTooltip.bind({})
WithIconTooltip.args = defaultProps
WithIconTooltip.parameters = templateParameters

export default storyConfig
