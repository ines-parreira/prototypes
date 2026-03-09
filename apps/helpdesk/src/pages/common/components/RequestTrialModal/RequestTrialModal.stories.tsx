import type { ComponentProps } from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Button } from '@gorgias/axiom'

import type { User } from 'config/types/user'
import { UserRole } from 'config/types/user'

import RequestTrialModal from './RequestTrialModal'

const adminNames = [
    { name: 'Alice Johnson', email: 'alice@company.com', color: '4A90E2' },
    { name: 'Bob Smith', email: 'bob@company.com', color: '4A90E2' },
    { name: 'Carol Williams', email: 'carol@company.com', color: 'E74C3C' },
    { name: 'David Brown', email: 'david@company.com', color: '9B59B6' },
    { name: 'Eva Davis', email: 'eva@company.com', color: '2ECC71' },
    { name: 'Frank Miller', email: 'frank@company.com', color: 'F39C12' },
    { name: 'Grace Wilson', email: 'grace@company.com', color: '1ABC9C' },
    { name: 'Henry Taylor', email: 'henry@company.com', color: 'F1C40F' },
    { name: 'Irene Clark', email: 'irene@company.com', color: 'E67E22' },
]

const mockAdmins: User[] = adminNames.map((admin, index) => {
    const [firstname, lastname] = admin.name.split(' ')
    return {
        id: index + 1,
        name: admin.name,
        email: admin.email,
        active: true,
        bio: null,
        country: 'US',
        language: 'en',
        created_datetime: '2023-01-01T00:00:00Z',
        deactivated_datetime: null,
        external_id: `ext-${index + 1}`,
        firstname,
        lastname,
        meta: {
            profile_picture_url:
                index % 2 === 0
                    ? '/static/image/static/media/src/assets/img/avatar-example.png'
                    : '',
        },
        updated_datetime: '2023-01-01T00:00:00Z',
        settings: [],
        timezone: 'America/New_York',
        has_2fa_enabled: false,
        client_id: null,
        role: { name: UserRole.Admin },
    }
})

const STANDARD_TITLE =
    "Request your admin to activate AI Agent's sales skills trial"
const STANDARD_SUBTITLE =
    'Your Gorgias admins will be notified of your request to start Shopping Assistant trial via both email and an in-app notification.'

const storyConfig: Meta<typeof RequestTrialModal> = {
    title: 'Overlays/RequestTrialModal',
    component: RequestTrialModal,
    parameters: {
        docs: {
            description: {
                component:
                    'A modal component for requesting trial access with admin list and optional note.',
            },
        },
    },
    argTypes: {
        title: {
            control: { type: 'text' },
            description: 'The title of the modal',
        },
        subtitle: {
            control: { type: 'text' },
            description: 'The subtitle text shown in the modal header',
        },
        primaryCTALabel: {
            control: { type: 'text' },
            description: 'The label for the primary action button',
        },
        accountAdmins: {
            control: { type: 'object' },
            description: 'Array of admin users to display',
        },
        isOpen: {
            control: { type: 'boolean' },
            description: 'Whether the modal is open',
        },
        onClose: {
            action: 'onClose',
            description: 'Callback when modal is closed',
        },
        onPrimaryAction: {
            action: 'onPrimaryAction',
            description: 'Callback when primary action is triggered',
        },
    },
}

type Story = StoryObj<typeof RequestTrialModal>

// Component wrapper to handle modal state
const ModalWrapper = (args: ComponentProps<typeof RequestTrialModal>) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div>
            <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
            <RequestTrialModal
                {...args}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onPrimaryAction={(note) => {
                    args.onPrimaryAction?.(note)
                    setIsOpen(false)
                }}
            />
        </div>
    )
}

const defaultProps: ComponentProps<typeof RequestTrialModal> = {
    title: STANDARD_TITLE,
    subtitle: STANDARD_SUBTITLE,
    accountAdmins: mockAdmins,
    primaryCTALabel: 'Notify Admins',
    isOpen: false,
    onClose: () => {},
    onPrimaryAction: () => {},
}

export const Default: Story = {
    render: (args) => <ModalWrapper {...args} />,
    args: defaultProps,
}

export const WithManyAdmins: Story = {
    render: (args) => <ModalWrapper {...args} />,
    args: {
        ...defaultProps,
        accountAdmins: mockAdmins,
    },
}

export const WithFewAdmins: Story = {
    render: (args) => <ModalWrapper {...args} />,
    args: {
        ...defaultProps,
        accountAdmins: mockAdmins.slice(0, 2),
    },
}

export const WithNoAdmins: Story = {
    render: (args) => <ModalWrapper {...args} />,
    args: {
        ...defaultProps,
        accountAdmins: [],
    },
}

export default storyConfig
