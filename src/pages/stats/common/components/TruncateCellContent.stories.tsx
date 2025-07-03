import { Meta, StoryObj } from '@storybook/react'

import { TruncateCellContent } from 'pages/stats/common/components/TruncateCellContent'

const storyConfig: Meta = {
    title: 'Stats/TruncateCellContent',
    component: TruncateCellContent,
}
const content = 'Lorem ipsum long cell content'
type Story = StoryObj<typeof TruncateCellContent>

export const DefaultTruncate: Story = {
    render: (args) => (
        <div style={{ maxWidth: '100px' }}>
            <TruncateCellContent {...args} />
        </div>
    ),
    args: {
        content,
        className: '',
        left: false,
    },
}

export const LeftTruncate: Story = {
    render: (args) => (
        <div style={{ maxWidth: '200px' }}>
            <TruncateCellContent {...args} />
            <TruncateCellContent content={content} left />
        </div>
    ),
    args: {
        content: 'Lorem > Lorem ipsum > Lorem ipsum long cell content:',
        className: '',
        left: true,
    },
}

export default storyConfig
