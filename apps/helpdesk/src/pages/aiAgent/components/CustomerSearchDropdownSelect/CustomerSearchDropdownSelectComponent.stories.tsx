import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { CustomerSearchDropdownSelectComponent } from './CustomerSearchDropdownSelectComponent'

const meta: Meta<typeof CustomerSearchDropdownSelectComponent> = {
    title: 'AI Agent/Playground/Customer Search',
    component: CustomerSearchDropdownSelectComponent,
    argTypes: {},
}

export default meta

type Story = StoryObj<typeof CustomerSearchDropdownSelectComponent>

const customerList = [
    {
        id: 1,
        address: 'customer1@example.com',
        type: 'individual',
        user: {
            id: 101,
            name: 'John Doe',
        },
        customer: {
            id: 201,
            name: 'Customer One',
        },
    },
    {
        id: 2,
        address: 'customer2@example.com',
        type: 'individual',
        user: {
            id: 102,
            name: 'Jane Smith',
        },
        customer: {
            id: 202,
            name: 'Customer Two',
        },
    },
    {
        id: 3,
        address: 'customer3@example.com',
        type: 'individual',
        user: {
            id: 103,
            name: 'Alice Johnson',
        },
        customer: {
            id: 203,
            name: 'Customer Three',
        },
    },
]

export const Default: Story = {
    render: (args) => (
        <div style={{ height: '200px' }}>
            <CustomerSearchDropdownSelectComponent {...args} />
        </div>
    ),
    args: {
        className: '',
        searchTerm: '',
        onSearch: () => {},
        isDropdownLoading: false,
        isCustomerListAvailable: true,
        isDropdownVisible: true,
        onSelect: () => {},
        customerList,
        focusedIndex: -1,
        setFocusedIndex: () => {},
    },
}

export const SearchLoading: Story = {
    render: (args) => (
        <div style={{ height: '200px' }}>
            <CustomerSearchDropdownSelectComponent {...args} />
        </div>
    ),
    args: {
        className: '',
        searchTerm: 'foo@bar.com',
        onSearch: () => {},
        isDropdownLoading: true,
        isCustomerListAvailable: false,
        isDropdownVisible: true,
        onSelect: () => {},
        focusedIndex: -1,
        setFocusedIndex: () => {},
    },
}
