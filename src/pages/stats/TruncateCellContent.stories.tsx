import { Meta, StoryObj } from '@storybook/react'

import { TruncateCellContent } from 'pages/stats/TruncateCellContent'

const storyConfig: Meta = {
    title: 'Stats/TruncateCellContent',
    component: TruncateCellContent,
}
const content = 'Lorem ipsum long cell content'
type Story = StoryObj<typeof TruncateCellContent>

export const Content: Story = {
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

export default storyConfig
