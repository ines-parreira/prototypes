import type React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ChatSettingsPageHeader from './ChatSettingsPageHeader'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
}))

const getBackButtonHref = () =>
    screen
        .getAllByRole('link', { name: 'arrow-left' })
        .find((el) => el.tagName === 'A' && el.hasAttribute('href'))

describe('ChatSettingsPageHeader', () => {
    describe('title rendering', () => {
        it('should render title', () => {
            render(<ChatSettingsPageHeader title="Chat Settings" />)

            expect(
                screen.getByRole('heading', { name: 'Chat Settings' }),
            ).toBeInTheDocument()
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

            expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
                'href',
                '/home',
            )

            expect(
                screen.queryByRole('link', { name: 'Chat' }),
            ).not.toBeInTheDocument()
        })

        it('should render without breadcrumb links when not provided', () => {
            render(<ChatSettingsPageHeader title="Chat Settings" />)

            expect(screen.queryAllByRole('link')).toHaveLength(0)
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

            expect(getBackButtonHref()).toHaveAttribute('href', '/back')
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

            expect(getBackButtonHref()).toHaveAttribute('href', '/settings')
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

            expect(getBackButtonHref()).toHaveAttribute('href', '/custom-back')
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
                screen.queryByRole('link', { name: 'arrow-left' }),
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
                screen.queryByRole('link', { name: 'arrow-left' }),
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
                screen.getByRole('button', { name: 'Save' }),
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

            await user.click(screen.getByRole('button', { name: 'Save' }))

            expect(onSave).toHaveBeenCalledTimes(1)
        })

        it('should not render save button when onSave is not provided', () => {
            render(<ChatSettingsPageHeader title="Chat Settings" />)

            expect(
                screen.queryByRole('button', { name: 'Save' }),
            ).not.toBeInTheDocument()
        })
    })
})
