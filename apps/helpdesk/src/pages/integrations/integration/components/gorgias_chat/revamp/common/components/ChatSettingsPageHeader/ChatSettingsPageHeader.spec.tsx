import type React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChatSettingsPageHeader } from './ChatSettingsPageHeader'

const mockPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
}))

beforeEach(() => {
    mockPush.mockClear()
})

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
            render(<ChatSettingsPageHeader title="Chat Settings" />)

            expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
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

            expect(
                screen.getByRole('button', { name: /go back/i }),
            ).toBeInTheDocument()
        })

        it('should navigate to link from breadcrumbItems when back button is clicked', async () => {
            const user = userEvent.setup()
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

            await user.click(screen.getByRole('button', { name: /go back/i }))
            expect(mockPush).toHaveBeenCalledWith('/settings')
        })

        it('should prioritize backButtonLink over breadcrumb links', async () => {
            const user = userEvent.setup()
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

            await user.click(screen.getByRole('button', { name: /go back/i }))
            expect(mockPush).toHaveBeenCalledWith('/custom-back')
        })

        it('should not render back button when showBackButton is false', () => {
            render(
                <ChatSettingsPageHeader
                    title="Chat Settings"
                    backButtonLink="/back"
                    showBackButton={false}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /go back/i }),
            ).not.toBeInTheDocument()
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

            expect(
                screen.queryByRole('button', { name: /go back/i }),
            ).not.toBeInTheDocument()
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

            expect(
                screen.getByRole('button', { name: /save/i }),
            ).toBeInTheDocument()
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

            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(onSave).toHaveBeenCalledTimes(1)
        })

        it('should not render save button when onSave is not provided', () => {
            render(<ChatSettingsPageHeader title="Chat Settings" />)

            expect(
                screen.queryByRole('button', { name: /save/i }),
            ).not.toBeInTheDocument()
        })
    })
})
