import type React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Language } from 'constants/languages'

import { LanguageRow } from './LanguageRow'

const mockPush = jest.fn()

jest.mock('@gorgias/axiom', () => ({
    Box: ({ children, ...rest }: { children: React.ReactNode }) => (
        <div {...rest}>{children}</div>
    ),
    Button: ({
        children,
        onClick,
        'aria-label': ariaLabel,
        isDisabled,
    }: {
        children?: React.ReactNode
        onClick?: () => void
        'aria-label'?: string
        isDisabled?: boolean
    }) => (
        <button onClick={onClick} aria-label={ariaLabel} disabled={isDisabled}>
            {children}
        </button>
    ),
    ButtonAs: { Button: 'button' },
    ButtonIntent: { Regular: 'regular' },
    ButtonSize: { Sm: 'sm' },
    ButtonVariant: { Secondary: 'secondary', Tertiary: 'tertiary' },
    IconName: { DotsMeatballsHorizontal: 'dots-meatballs-horizontal' },
    Menu: ({
        trigger,
        children,
    }: {
        trigger: React.ReactNode
        children: React.ReactNode
    }) => (
        <div>
            {trigger}
            {children}
        </div>
    ),
    MenuItem: ({
        label,
        onAction,
    }: {
        label: string
        onAction: () => void
    }) => <button onClick={onAction}>{label}</button>,
    MenuSection: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    Tag: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
    ),
    TagColor: { Purple: 'purple' },
    TagSize: { Sm: 'sm' },
    Text: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
    ),
    TextSize: { Md: 'md' },
}))

jest.mock('react-router-dom', () => ({
    useHistory: () => ({ push: mockPush }),
}))

const defaultLanguage = {
    language: Language.EnglishUs,
    label: 'English - US',
    link: '/app/settings/channels/gorgias-chat/1/languages/en-US',
    primary: false,
    showActions: true,
}

beforeEach(() => {
    mockPush.mockClear()
})

describe('LanguageRow', () => {
    describe('language name', () => {
        it('should render the language label', () => {
            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(screen.getByText('English - US')).toBeInTheDocument()
        })

        it('should render Default tag when language is primary', () => {
            const primaryLanguage = { ...defaultLanguage, primary: true }

            render(
                <LanguageRow
                    language={primaryLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(screen.getByText('Default')).toBeInTheDocument()
        })

        it('should not render Default tag when language is not primary', () => {
            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(screen.queryByText('Default')).not.toBeInTheDocument()
        })
    })

    describe('Customize button', () => {
        it('should navigate to language link when Customize is clicked', async () => {
            const user = userEvent.setup()

            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            await user.click(screen.getByRole('button', { name: /customize/i }))

            expect(mockPush).toHaveBeenCalledWith(defaultLanguage.link)
        })

        it('should disable the Customize button when update is pending', () => {
            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={true}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(
                screen.getByRole('button', { name: /customize/i }),
            ).toBeDisabled()
        })
    })

    describe('actions menu', () => {
        it('should render the More actions button when showActions is true', () => {
            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(
                screen.getByRole('button', { name: /more actions/i }),
            ).toBeInTheDocument()
        })

        it('should not render the More actions button when showActions is false', () => {
            const singleLanguage = { ...defaultLanguage, showActions: false }

            render(
                <LanguageRow
                    language={singleLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /more actions/i }),
            ).not.toBeInTheDocument()
        })

        it('should disable the More actions button when language is primary', () => {
            const primaryLanguage = {
                ...defaultLanguage,
                primary: true,
                showActions: true,
            }

            render(
                <LanguageRow
                    language={primaryLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(
                screen.getByRole('button', { name: /more actions/i }),
            ).toBeDisabled()
        })

        it('should disable the More actions button when update is pending', () => {
            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={true}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            expect(
                screen.getByRole('button', { name: /more actions/i }),
            ).toBeDisabled()
        })

        it('should call onClickSetDefault when Make default language is clicked', async () => {
            const user = userEvent.setup()
            const onClickSetDefault = jest.fn()

            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={onClickSetDefault}
                    onOpenDeleteModal={jest.fn()}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /make default language/i }),
            )

            expect(onClickSetDefault).toHaveBeenCalledWith(defaultLanguage)
        })

        it('should call onOpenDeleteModal when Delete is clicked', async () => {
            const user = userEvent.setup()
            const onOpenDeleteModal = jest.fn()

            render(
                <LanguageRow
                    language={defaultLanguage}
                    isUpdatePending={false}
                    onClickSetDefault={jest.fn()}
                    onOpenDeleteModal={onOpenDeleteModal}
                />,
            )

            await user.click(screen.getByRole('button', { name: /^delete$/i }))

            expect(onOpenDeleteModal).toHaveBeenCalledWith(defaultLanguage)
        })
    })
})
