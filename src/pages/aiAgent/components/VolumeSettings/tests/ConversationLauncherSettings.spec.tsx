import { ReactNode } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import {
    ConversationLauncherAdvancedSettings,
    ConversationLauncherSettings,
} from '../ConversationLauncherSettings'

type FormValues = {
    isFloatingInputEnabled?: boolean
    isFloatingInputDesktopOnly?: boolean
}

const Wrapper = ({
    children,
    defaultValues = {
        isFloatingInputEnabled: false,
        isFloatingInputDesktopOnly: false,
    },
}: {
    children: ReactNode
    defaultValues?: FormValues
}) => {
    const methods = useForm<FormValues>({ defaultValues })

    return <FormProvider {...methods}>{children}</FormProvider>
}

describe('ConversationLauncherSettings', () => {
    it('renders the main Conversation Launcher title', () => {
        render(
            <Wrapper>
                <ConversationLauncherSettings />
            </Wrapper>,
        )

        expect(screen.getByText('Conversation Launcher')).toBeInTheDocument()
        expect(screen.getByText('Enable Floating Input')).toBeInTheDocument()
        expect(screen.getByText('Advanced settings')).toBeInTheDocument()
    })

    it('does not allow opening Advanced settings when toggle is off', () => {
        render(
            <Wrapper>
                <ConversationLauncherSettings />
            </Wrapper>,
        )

        fireEvent.click(screen.getByText('Advanced settings'))

        expect(
            screen.queryByText('Floating Input: Advanced Settings'),
        ).not.toBeInTheDocument()
    })

    it('opens Advanced settings when toggle is on', () => {
        render(
            <Wrapper defaultValues={{ isFloatingInputEnabled: true }}>
                <ConversationLauncherSettings />
            </Wrapper>,
        )

        fireEvent.click(screen.getByText('Advanced settings'))

        expect(
            screen.getByText('Floating Input: Advanced Settings'),
        ).toBeInTheDocument()
    })
})

describe('ConversationLauncherAdvancedSettings', () => {
    const mockOnClose = jest.fn()

    it('renders nothing when isOpen is false', () => {
        const { container } = render(
            <Wrapper>
                <ConversationLauncherAdvancedSettings
                    isOpen={false}
                    onClose={mockOnClose}
                />
            </Wrapper>,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('renders toggle and buttons when open', () => {
        render(
            <Wrapper defaultValues={{ isFloatingInputDesktopOnly: false }}>
                <ConversationLauncherAdvancedSettings
                    isOpen
                    onClose={mockOnClose}
                />
            </Wrapper>,
        )

        expect(
            screen.getByText('Floating Input: Advanced Settings'),
        ).toBeInTheDocument()
        expect(screen.getByRole('switch')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Update' })).toHaveAttribute(
            'aria-disabled',
            'true',
        )
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).not.toBeDisabled()
    })

    it('enables Update button when local toggle changes', () => {
        render(
            <Wrapper defaultValues={{ isFloatingInputDesktopOnly: false }}>
                <ConversationLauncherAdvancedSettings
                    isOpen
                    onClose={mockOnClose}
                />
            </Wrapper>,
        )

        const toggle = screen.getByRole('switch')
        fireEvent.click(toggle)

        expect(
            screen.getByRole('button', { name: 'Update' }),
        ).not.toBeDisabled()
    })

    it('calls onClose and setValue on update', () => {
        render(
            <Wrapper defaultValues={{ isFloatingInputDesktopOnly: false }}>
                <ConversationLauncherAdvancedSettings
                    isOpen
                    onClose={mockOnClose}
                />
            </Wrapper>,
        )

        fireEvent.click(screen.getByRole('switch'))
        fireEvent.click(screen.getByRole('button', { name: 'Update' }))

        expect(mockOnClose).toHaveBeenCalled()
    })
})
