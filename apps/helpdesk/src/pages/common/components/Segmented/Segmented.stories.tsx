import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import Segmented from './Segmented'

const storyConfig: Meta = {
    title: 'Data Display/Segmented',
    component: Segmented,
}

const Template: StoryObj<typeof Segmented> = {
    render: function Template(props) {
        return <Segmented {...props} />
    },
}

export const Basic = {
    ...Template,
    args: {
        options: [
            {
                value: 'self-service',
                label: 'Self-Service',
            },
            {
                value: 'article-recommendation',
                label: 'Article Recommendation',
            },
        ],
        value: 'self-service',
        onChange: () => null,
    },
}

export const Disabled = {
    ...Template,
    args: {
        options: [
            {
                value: 'self-service',
                label: 'Self-Service',
            },
            {
                value: 'article-recommendation',
                label: 'Article Recommendation',
                disabled: true,
            },
        ],
        value: 'self-service',
        onChange: () => null,
    },
}

export default storyConfig
