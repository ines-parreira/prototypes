import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import previewDark from 'assets/img/help-center/preview-dark.svg'
import previewLight from 'assets/img/help-center/preview-light.svg'

import { PreviewRadioButton } from './PreviewRadioButton'

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
        },
    },
}

const DefaultTemplate: StoryObj<typeof PreviewRadioButton> = {
    render: function Template(props) {
        return <PreviewRadioButton {...props} />
    },
}

const Template: StoryObj<typeof PreviewRadioButton> = {
    render: function Template(props) {
        const [selectedValue, setSelectedValue] = useState<string | null>(null)

        const update = (value?: string) => setSelectedValue(value!)

        return (
            <div style={{ display: 'flex', gap: '20px' }}>
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
    },
}

const TemplateWithoutPreview: StoryObj<typeof PreviewRadioButton> = {
    render: function TemplateWithoutPreview(props) {
        const [selectedValue, setSelectedValue] = useState<string | null>(null)

        const update = (value?: string) => setSelectedValue(value!)

        return (
            <div style={{ display: 'flex', gap: '20px' }}>
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
    },
}

const templateParameters = {
    controls: {
        include: [],
    },
}

export const Default = {
    ...DefaultTemplate,
    args: {
        label: 'Foo bar',
    },
}

export const WithPreview = {
    ...Template,
    parameters: templateParameters,
}

export const WithoutPreview = {
    ...TemplateWithoutPreview,
    parameters: templateParameters,
}

export default storyConfig
