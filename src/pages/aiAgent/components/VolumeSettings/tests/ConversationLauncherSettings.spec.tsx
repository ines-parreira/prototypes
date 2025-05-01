import { ReactNode } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { ldClientMock } from 'jest-launchdarkly-mock'
import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter } from 'react-router-dom'

import { getLDClient } from 'utils/launchDarkly'

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

    return (
        <MemoryRouter>
            <FormProvider {...methods}>{children}</FormProvider>
        </MemoryRouter>
    )
}

describe('ConversationLauncherSettings', () => {
    const getCardTitle = () => {
        return screen.getAllByText('Ask Anything Input')[0]
    }

    beforeEach(() => {
        ldClientMock.allFlags.mockReturnValue({})
        let client = getLDClient()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        client = ldClientMock
    })

    it('renders the main Ask Anything Input title', () => {
        render(
            <Wrapper>
                <ConversationLauncherSettings />
            </Wrapper>,
        )

        expect(getCardTitle()).toBeInTheDocument()
        expect(
            screen.getByText('Unlock up to ~5% additional GMV'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Drive more sales by adding an always-on input field that encourages shoppers to start a conversation.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByAltText(
                'image showing an example of the ask anything input',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Advanced settings')).toBeInTheDocument()
    })

    it('does not allow opening Advanced settings when toggle is off', () => {
        const { container } = render(
            <Wrapper>
                <ConversationLauncherSettings />
            </Wrapper>,
        )

        fireEvent.click(screen.getByText('Advanced settings'))

        const sidebar = container.querySelector('[class*="sidebar"]')
        expect(sidebar).toHaveClass('slideOut')
    })

    it('opens Advanced settings when toggle is on', () => {
        render(
            <Wrapper defaultValues={{ isFloatingInputEnabled: true }}>
                <ConversationLauncherSettings />
            </Wrapper>,
        )

        fireEvent.click(screen.getByText('Advanced settings'))

        expect(screen.getByText('Enable on Desktop only')).toBeVisible()
    })
})

describe('ConversationLauncherAdvancedSettings', () => {
    const mockOnClose = jest.fn()

    it('renders with slide out animation class when isOpen is false', () => {
        const { container } = render(
            <Wrapper>
                <ConversationLauncherAdvancedSettings
                    isOpen={false}
                    onClose={mockOnClose}
                />
            </Wrapper>,
        )

        const sidebar = container.querySelector('[class*="sidebar"]')
        expect(sidebar).toHaveClass('slideOut')
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

        expect(screen.getByText('Enable on Desktop only')).toBeInTheDocument()
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
