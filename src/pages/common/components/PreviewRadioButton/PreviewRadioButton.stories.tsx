import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import previewLight from 'assets/img/help-center/preview-light.svg'
import {PreviewRadioButton} from './PreviewRadioButton'

const storyConfig: Meta = {
    title: 'Data entry/PreviewRadioButton',
    component: PreviewRadioButton,
    argTypes: {
        isSelected: {
            control: {
                type: 'boolean',
            },
        },
        onClick: {
            action: 'clicked!',
            table: {
                disable: true,
            },
        },
        preview: {
            description:
                'Custom JSX you can pass to be displayed above the radio button.',
            control: {
                type: null,
            },
        },
    },
}

const Template: Story<ComponentProps<typeof PreviewRadioButton>> = (props) => (
    <PreviewRadioButton {...props} />
)
const templateParameters = {
    controls: {
        include: ['isSelected', 'title', 'onClick', 'preview'],
    },
}

const defaultProps: Partial<ComponentProps<typeof PreviewRadioButton>> = {
    isSelected: false,
    title: 'Click me!',
}

export const WithPreview = Template.bind({})
WithPreview.args = {
    ...defaultProps,
    preview: <img src={previewLight} alt="preview-light" />,
}
WithPreview.parameters = templateParameters

export const WithoutPreview = Template.bind({})
WithoutPreview.parameters = templateParameters
WithoutPreview.args = defaultProps

export default storyConfig
