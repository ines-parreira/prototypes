import { render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { Button, MenuItem, MenuSection } from '@gorgias/axiom'
import { mockGetCurrentUserHandler } from '@gorgias/helpdesk-mocks'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { UserMenu } from '../UserMenu'

jest.mock('../userMenu/useNoticeableWidget', () => ({
    useNoticeableWidget: jest.fn(),
}))

jest.mock('../userMenu/UserMenuTrigger', () => ({
    UserMenuTrigger: jest.fn(
        ({
            user,
        }: {
            user: {
                id: number
                name?: string
                email?: string
                meta?: { profile_picture_url?: string }
            }
        }) => {
            const label = `trigger:${user.id}:${user.name ?? user.email}:${String(user.meta?.profile_picture_url)}`
            return <Button aria-label={label}>{label}</Button>
        },
    ),
}))

jest.mock('../userMenu/UserMenuUserHeader', () => ({
    UserMenuUserHeader: jest.fn(() => (
        <MenuSection id="user-header" name="header-section">
            {null}
        </MenuSection>
    )),
}))

jest.mock('../userMenu/UserMenuStatusSubMenu', () => ({
    UserMenuStatusSubMenu: jest.fn(() => (
        <MenuItem id="status" label="status-item" />
    )),
}))

jest.mock('../userMenu/UserMenuThemeSubMenu', () => ({
    UserMenuThemeSubMenu: jest.fn(() => (
        <MenuItem id="theme" label="theme-item" />
    )),
}))

jest.mock('../userMenu/UserMenuBetaSection', () => ({
    UserMenuBetaSection: jest.fn(() => (
        <MenuSection id="beta" name="beta-section">
            {null}
        </MenuSection>
    )),
}))

jest.mock('../userMenu/UserMenuLinksSection', () => ({
    UserMenuLinksSection: jest.fn(() => (
        <MenuSection id="links" name="links-section">
            {null}
        </MenuSection>
    )),
}))

jest.mock('../userMenu/UserMenuAccountSection', () => ({
    UserMenuAccountSection: jest.fn(() => (
        <MenuSection id="account" name="account-section">
            {null}
        </MenuSection>
    )),
}))

const { useNoticeableWidget } = jest.requireMock(
    '../userMenu/useNoticeableWidget',
)
const useNoticeableWidgetMock = useNoticeableWidget as jest.Mock

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

const renderUserMenu = () => {
    const queryClient = mockQueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            <UserMenu />
        </QueryClientProvider>,
    )
}

describe('UserMenu', () => {
    it('returns null while the current user query has no data', () => {
        server.use(
            mockGetCurrentUserHandler(async () =>
                HttpResponse.json({ id: 1 } as any),
            ).handler,
        )

        const { container } = renderUserMenu()

        expect(container).toBeEmptyDOMElement()
        expect(useNoticeableWidgetMock).not.toHaveBeenCalled()
    })

    it('returns null when the current user has no id', async () => {
        server.use(
            mockGetCurrentUserHandler(async () =>
                HttpResponse.json({ email: 'a@b.c' } as any),
            ).handler,
        )

        const { container } = renderUserMenu()

        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(container).toBeEmptyDOMElement()
    })

    it('renders the full menu and calls useNoticeableWidget when the user is loaded', async () => {
        const user = userEvent.setup()
        server.use(
            mockGetCurrentUserHandler(async () =>
                HttpResponse.json({
                    id: 123,
                    name: 'Jane',
                    email: 'jane@example.com',
                    role: { name: 'admin' },
                    meta: {
                        profile_picture_url: 'https://img.example/jane.png',
                    },
                } as any),
            ).handler,
        )

        renderUserMenu()

        const trigger = await screen.findByRole('button', {
            name: 'trigger:123:Jane:https://img.example/jane.png',
        })
        await user.click(trigger)

        expect(await screen.findByText('header-section')).toBeInTheDocument()
        expect(screen.getByText('status-item')).toBeInTheDocument()
        expect(screen.getByText('theme-item')).toBeInTheDocument()
        expect(screen.getByText('beta-section')).toBeInTheDocument()
        expect(screen.getByText('links-section')).toBeInTheDocument()
        expect(screen.getByText('account-section')).toBeInTheDocument()
        expect(useNoticeableWidgetMock).toHaveBeenCalled()
    })

    it('falls back to the email when the user has no name', async () => {
        server.use(
            mockGetCurrentUserHandler(async () =>
                HttpResponse.json({
                    id: 42,
                    email: 'noname@example.com',
                    meta: {},
                } as any),
            ).handler,
        )

        renderUserMenu()

        expect(
            await screen.findByText('trigger:42:noname@example.com:undefined'),
        ).toBeInTheDocument()
    })

    it('forwards the user to the trigger even when name and email are missing', async () => {
        server.use(
            mockGetCurrentUserHandler(async () =>
                HttpResponse.json({ id: 7 } as any),
            ).handler,
        )

        renderUserMenu()

        expect(
            await screen.findByText('trigger:7:undefined:undefined'),
        ).toBeInTheDocument()
    })
})
