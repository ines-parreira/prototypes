import type React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ChatSettingsPageHeader from './ChatSettingsPageHeader'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Breadcrumb: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    Breadcrumbs: ({
        items,
        children,
    }: {
        items: Array<{ id: string; label: string; link?: string }>
        children: (item: {
            id: string
            label: string
            link?: string
        }) => React.ReactNode
    }) => (
        <nav>
            {items.map((item) => (
                <div key={item.id}>{children(item)}</div>
            ))}
        </nav>
    ),
    Button: ({
        children,
        onClick,
        icon,
    }: {
        children?: React.ReactNode
        onClick?: () => void
        icon?: string
    }) => (
        <button onClick={onClick} data-icon={icon}>
            {children}
        </button>
    ),
    Heading: ({ children }: { children: React.ReactNode }) => (
        <h1>{children}</h1>
    ),
    Text: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
    ),
    TextSize: { Sm: 'sm' },
    TextVariant: { Medium: 'medium' },
    ButtonIntent: { Regular: 'regular' },
    ButtonVariant: { Primary: 'primary', Secondary: 'secondary' },
    ButtonSize: { Md: 'md' },
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: ({
        children,
        to,
        'data-testid': dataTestId,
    }: {
        children: React.ReactNode
        to: string
        'data-testid'?: string
    }) => (
        <a href={to} data-testid={dataTestId}>
            {children}
        </a>
    ),
}))

describe('ChatSettingsPageHeader', () => {
    describe('title rendering', () => {
        it('should render title', () => {
            render(<ChatSettingsPageHeader title="Chat Settings" />)

            expect(screen.getByText('Chat Settings')).toBeInTheDocument()
        })
    })

    describe('breadcrumbs rendering', () => {
        it('should render breadcrumb items with links', () => {
            const breadcrumbItems = [
                { id: '1', label: 'Home', link: '/home' },
                { id: '2', label: 'Settings', link: '/settings' },
                { id: '3', label: 'Chat' },
            ]

            render(
                <ChatSettingsPageHeader
                    title="Chat Settings"
                    breadcrumbItems={breadcrumbItems}
                />,
            )

            expect(screen.getByText('Home')).toBeInTheDocument()
            expect(screen.getByText('Settings')).toBeInTheDocument()
            expect(screen.getByText('Chat')).toBeInTheDocument()
        })

        it('should render links for breadcrumb items with link property', () => {
            const breadcrumbItems = [
                { id: '1', label: 'Home', link: '/home' },
                { id: '2', label: 'Chat' },
            ]

            render(
                <ChatSettingsPageHeader
                    title="Chat Settings"
                    breadcrumbItems={breadcrumbItems}
                />,
            )

            const homeLink = screen.getByText('Home').closest('a')
            expect(homeLink).toHaveAttribute('href', '/home')

            const chatLink = screen.queryByText('Chat')?.closest('a')
            expect(chatLink).not.toBeInTheDocument()
        })

        it('should render without breadcrumbs when not provided', () => {
            const { container } = render(
                <ChatSettingsPageHeader title="Chat Settings" />,
            )

            const nav = container.querySelector('nav')
            expect(nav).toBeInTheDocument()
            expect(nav?.children).toHaveLength(0)
        })
    })

    describe('back button rendering', () => {
        it('should render back button when backButtonLink is provided', () => {
            render(
                <ChatSettingsPageHeader
                    title="Chat Settings"
                    backButtonLink="/back"
                />,
            )

            const backButton = screen.getByTestId(
                'chat-settings-header-back-button',
            )
            expect(backButton).toBeInTheDocument()
        })

        it('should render back button with link from breadcrumbItems', () => {
            const breadcrumbItems = [
                { id: '1', label: 'Home', link: '/home' },
                { id: '2', label: 'Settings', link: '/settings' },
                { id: '3', label: 'Chat' },
            ]

            render(
                <ChatSettingsPageHeader
                    title="Chat Settings"
                    breadcrumbItems={breadcrumbItems}
                />,
            )

            const backButton = screen.getByTestId(
                'chat-settings-header-back-button',
            )
            expect(backButton).toHaveAttribute('href', '/settings')
        })

        it('should prioritize backButtonLink over breadcrumb links', () => {
            const breadcrumbItems = [
                { id: '1', label: 'Home', link: '/home' },
                { id: '2', label: 'Settings', link: '/settings' },
            ]

            render(
                <ChatSettingsPageHeader
                    title="Chat Settings"
                    breadcrumbItems={breadcrumbItems}
                    backButtonLink="/custom-back"
                />,
            )

            const backButton = screen.getByTestId(
                'chat-settings-header-back-button',
            )
            expect(backButton).toHaveAttribute('href', '/custom-back')
        })

        it('should not render back button when showBackButton is false', () => {
            render(
                <ChatSettingsPageHeader
                    title="Chat Settings"
                    backButtonLink="/back"
                    showBackButton={false}
                />,
            )

            const backButton = screen.queryByTestId(
                'chat-settings-header-back-button',
            )
            expect(backButton).not.toBeInTheDocument()
        })

        it('should not render back button when no links are available', () => {
            const breadcrumbItems = [
                { id: '1', label: 'Home' },
                { id: '2', label: 'Settings' },
            ]

            render(
                <ChatSettingsPageHeader
                    title="Chat Settings"
                    breadcrumbItems={breadcrumbItems}
                />,
            )

            const backButton = screen.queryByTestId(
                'chat-settings-header-back-button',
            )
            expect(backButton).not.toBeInTheDocument()
        })
    })

    describe('save button rendering', () => {
        it('should render save button when onSave is provided', () => {
            const onSave = jest.fn()

            render(
                <ChatSettingsPageHeader
                    title="Chat Settings"
                    onSave={onSave}
                />,
            )

            const saveButton = screen.getByTestId(
                'chat-settings-header-action-button',
            )
            expect(saveButton).toBeInTheDocument()
        })

        it('should call onSave when save button is clicked', async () => {
            const user = userEvent.setup()
            const onSave = jest.fn()

            render(
                <ChatSettingsPageHeader
                    title="Chat Settings"
                    onSave={onSave}
                />,
            )

            const saveButton = screen.getByTestId(
                'chat-settings-header-action-button',
            )
            await user.click(saveButton.querySelector('button')!)

            expect(onSave).toHaveBeenCalledTimes(1)
        })

        it('should not render save button when onSave is not provided', () => {
            render(<ChatSettingsPageHeader title="Chat Settings" />)

            const saveButton = screen.queryByTestId(
                'chat-settings-header-action-button',
            )
            expect(saveButton).not.toBeInTheDocument()
        })
    })
})
