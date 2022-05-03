import React, {ComponentProps, useState} from 'react'
import {Meta, Story} from '@storybook/react'

import previewLight from 'assets/img/help-center/preview-light.svg'
import previewDark from 'assets/img/help-center/preview-dark.svg'
import {PreviewRadioButton} from './PreviewRadioButton'

const storyConfig: Meta = {
    title: 'Data entry/PreviewRadioButton',
    component: PreviewRadioButton,
    argTypes: {
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

const DefaultTemplate: Story<ComponentProps<typeof PreviewRadioButton>> = (
    props
) => <PreviewRadioButton {...props} />

const Template: Story<ComponentProps<typeof PreviewRadioButton>> = (props) => {
    const [selectedValue, setSelectedValue] = useState<string | null>(null)

    const update = (value?: string) => setSelectedValue(value!)

    return (
        <div style={{display: 'flex', gap: '20px'}}>
            <PreviewRadioButton
                {...props}
                isSelected={selectedValue === 'light'}
                label="Light"
                onClick={() => update('light')}
                preview={<img src={previewLight} alt="preview-light" />}
                value="light"
            />
            <PreviewRadioButton
                {...props}
                isSelected={selectedValue === 'dark'}
                label="Dark"
                onClick={() => update('dark')}
                preview={<img src={previewDark} alt="preview-dark" />}
                value="dark"
            />
        </div>
    )
}

const TemplateWithoutPreview: Story<ComponentProps<typeof PreviewRadioButton>> =
    (props) => {
        const [selectedValue, setSelectedValue] = useState<string | null>(null)

        const update = (value?: string) => setSelectedValue(value!)

        return (
            <div style={{display: 'flex', gap: '20px'}}>
                <PreviewRadioButton
                    {...props}
                    isSelected={selectedValue === 'light'}
                    label="Light"
                    onClick={() => update('light')}
                    value="light"
                />
                <PreviewRadioButton
                    {...props}
                    isSelected={selectedValue === 'dark'}
                    label="Dark"
                    onClick={() => update('dark')}
                    value="dark"
                />
            </div>
        )
    }

const templateParameters = {
    controls: {
        include: [],
    },
}

export const Default = DefaultTemplate.bind({})
Default.args = {
    label: 'Foo bar',
}

export const WithPreview = Template.bind({})
WithPreview.parameters = templateParameters

export const WithoutPreview = TemplateWithoutPreview.bind({})
WithoutPreview.parameters = templateParameters

export default storyConfig
