import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { DropdownSelector } from './DropdownSelector'

const meta = {
    title: 'AI Agent/Onboarding_V2/DropdownSelector',
    component: DropdownSelector,
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof DropdownSelector>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: function Template(args) {
        return <DropdownSelector {...args} />
    },
    args: {
        items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' },
        ],
        selectedItem: { id: 1, name: 'Item 1' },
        selectedKey: 1,
        getItemKey: (item: { id: number }) => item.id,
        getItemLabel: (item: { name: string }) => item.name,
        setSelectedKey: () => {},
    },
}
