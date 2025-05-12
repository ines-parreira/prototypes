import { Meta, StoryObj } from '@storybook/react'

import VisibilityCell, { VisibilityCellProps } from './VisibilityCell'

const storyConfig: Meta = {
    title: 'Help Center/VisibilityCell',
    component: VisibilityCell,
    argTypes: {
        status: {
            options: ['Public', 'Unlisted'],
            mapping: {
                ['Public']: 'PUBLIC',
                ['Unlisted']: 'UNLISTED',
            },
        },
    },
}

type Story = StoryObj<typeof VisibilityCell>

const Template: Story = {
    render: ({ status }) => <VisibilityCell status={status} />,
}

const defaultProps: Partial<VisibilityCellProps> = {
    status: 'PUBLIC',
}

const templateParameters = {
    controls: {
        include: ['status'],
    },
}

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig
