import type { ComponentProps } from 'react'
import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'
import { action } from 'storybook/actions'

import { Button } from '@gorgias/axiom'

import { OptOutModal } from './OptOutModal'

const meta: Meta<typeof OptOutModal> = {
    title: 'Overlays/OptOutModal',
    component: OptOutModal,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A compound component for displaying opt-out modals with customizable content and actions.',
            },
        },
    },
    argTypes: {
        title: {
            control: 'text',
            description: 'Modal title displayed in the header',
        },
        isLoading: {
            control: 'boolean',
            description: 'Loading state for the destructive action button',
        },
        isOpen: {
            control: 'boolean',
            description: 'Controls modal visibility',
        },
        onOptOut: {
            action: 'onOptOut',
            description:
                'Callback fired when the destructive action is clicked',
        },
        onClose: {
            action: 'onClose',
            description: 'Callback fired when the modal should be closed',
        },
        onDismiss: {
            action: 'onDismiss',
            description: 'Callback fired when the secondary action is clicked',
        },
    },
    args: {
        isOpen: false,
        isLoading: false,
        onOptOut: action('onOptOut'),
        onClose: action('onClose'),
        onDismiss: action('onDismiss'),
    },
}

export default meta
type Story = StoryObj<typeof OptOutModal>

const ModalWrapper = ({
    children,
    ...args
}: ComponentProps<typeof OptOutModal>) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div>
            <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
            <OptOutModal
                {...args}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onOptOut={() => {
                    args.onOptOut?.()
                    setIsOpen(false)
                }}
                onDismiss={() => {
                    args.onDismiss?.()
                    setIsOpen(false)
                }}
            >
                {children}
            </OptOutModal>
        </div>
    )
}

export const Default: Story = {
    args: {
        title: 'Opt out of upgrade?',
    },
    render: (args) => (
        <ModalWrapper {...args}>
            <OptOutModal.Body>
                <p>
                    Are you sure you want to opt out of this upgrade?
                    You&apos;ll lose access to premium features.
                </p>
            </OptOutModal.Body>
            <OptOutModal.Actions>
                <OptOutModal.SecondaryAction>
                    Keep Premium
                </OptOutModal.SecondaryAction>
                <OptOutModal.DestructiveAction>
                    Opt Out
                </OptOutModal.DestructiveAction>
            </OptOutModal.Actions>
        </ModalWrapper>
    ),
}

export const TrialExpiry: Story = {
    args: {
        title: 'Trial ending soon',
    },
    render: (args) => (
        <ModalWrapper {...args}>
            <OptOutModal.Body>
                <p>
                    Your trial will expire in 2 days. Would you like to extend
                    your trial or upgrade to continue using premium features?
                </p>
                <ul>
                    <li>Advanced AI capabilities</li>
                    <li>Priority customer support</li>
                    <li>Custom integrations</li>
                </ul>
            </OptOutModal.Body>
            <OptOutModal.Actions>
                <OptOutModal.SecondaryAction>
                    Request Trial Extension
                </OptOutModal.SecondaryAction>
                <OptOutModal.DestructiveAction>
                    Continue with Free Plan
                </OptOutModal.DestructiveAction>
            </OptOutModal.Actions>
        </ModalWrapper>
    ),
}

export const LoadingState: Story = {
    args: {
        title: 'Processing your request',
        isLoading: true,
    },
    render: (args) => (
        <ModalWrapper {...args}>
            <OptOutModal.Body>
                <p>
                    This action will permanently remove your access to premium
                    features. This cannot be undone.
                </p>
            </OptOutModal.Body>
            <OptOutModal.Actions>
                <OptOutModal.SecondaryAction>
                    Cancel
                </OptOutModal.SecondaryAction>
                <OptOutModal.DestructiveAction>
                    Confirm Opt Out
                </OptOutModal.DestructiveAction>
            </OptOutModal.Actions>
        </ModalWrapper>
    ),
}
