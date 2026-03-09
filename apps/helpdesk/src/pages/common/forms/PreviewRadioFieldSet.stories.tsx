import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import previewDark from 'assets/img/help-center/preview-dark.svg'
import previewLight from 'assets/img/help-center/preview-light.svg'

import PreviewRadioFieldSet from './PreviewRadioFieldSet'

const meta: Meta = {
    title: 'Common/Forms/PreviewRadioFieldSet',
    component: PreviewRadioFieldSet,
    argTypes: {
        options: {
            control: 'object',
        },
        value: {
            control: 'text',
        },
    },
}

export default meta

type Story = StoryObj<typeof PreviewRadioFieldSet>

export const Default: Story = {
    render: (args) => <PreviewRadioFieldSet {...args} />,
    args: {
        options: [
            {
                value: 'light',
                label: 'Light',
                caption: 'Light theme',
                preview: <img src={previewLight} alt="preview-light" />,
            },
            {
                value: 'dark',
                label: 'Dark',
                caption: 'Dark theme',
                preview: <img src={previewDark} alt="preview-dark" />,
            },
        ],
        value: 'light',
    },
}

export const WithoutPreview: Story = {
    render: (args) => <PreviewRadioFieldSet {...args} />,
    args: {
        options: [
            {
                value: 'light',
                label: 'Light',
                caption: 'Light theme',
            },
            {
                value: 'dark',
                label: 'Dark',
                caption: 'Dark theme',
            },
        ],
        value: 'light',
    },
}
