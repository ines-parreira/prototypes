import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { MockSidebarProvider } from '@repo/navigation/fixtures'
import { assumeMock } from '@repo/testing'
import { useCurrentUserRole } from '@repo/users'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { Product, productConfig } from 'routes/layout/productConfig'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { SidebarProductHeader } from '../SidebarProductHeader'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

jest.mock('@repo/users', () => ({
    ...jest.requireActual('@repo/users'),
    useCurrentUserRole: jest.fn(),
}))

const mockUseFlag = assumeMock(useFlag)
const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)
const mockUseCurrentUserRole = assumeMock(useCurrentUserRole)

const mockToggleCollapse = jest.fn()
const queryClient = mockQueryClient()

const createWrapper =
    (isCollapsed = false) =>
    ({ children }: { children: ReactNode }) => (
        <MemoryRouter>
            <QueryClientProvider client={queryClient}>
                <MockSidebarProvider
                    isCollapsed={isCollapsed}
                    toggleCollapse={mockToggleCollapse}
                >
                    {children}
                </MockSidebarProvider>
            </QueryClientProvider>
        </MemoryRouter>
    )

function renderComponent(isCollapsed = false) {
    render(
        <SidebarProductHeader selectedItem={productConfig[Product.Inbox]} />,
        { wrapper: createWrapper(isCollapsed) },
    )
}

async function openProductMenu(user: ReturnType<typeof userEvent.setup>) {
    await act(() => user.click(screen.getByRole('button')))

    const menus = await screen.findAllByRole('menu')
    return menus.at(-1)!
}

function expectMenuItems(menu: HTMLElement, labels: string[]) {
    labels.forEach((label) => {
        expect(within(menu).getByText(label)).toBeInTheDocument()
    })
}

describe('SidebarProductHeader', () => {
    beforeEach(() => {
        mockToggleCollapse.mockClear()
        mockUseFlag.mockReturnValue(false)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseCurrentUserRole.mockReturnValue({
            isAdmin: true,
            hasRole: jest.fn().mockReturnValue(true),
            currentUser: { id: 1, role: { name: 'viewer' } },
        })
    })

    describe('when sidebar is expanded', () => {
        it('should render trigger button with selected item name', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /Inbox/i }),
            ).toBeInTheDocument()
        })

        it('should render core menu items when clicked', async () => {
            const user = userEvent.setup()

            renderComponent()

            const menu = await openProductMenu(user)

            expectMenuItems(menu, [
                'Home',
                'Inbox',
                'AI Agent',
                'Analytics',
                'Workflows',
                'Customers',
                'Convert',
            ])
        })

        it('should not render AI Journey menu item when AiJourneyEnabled flag is off', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockImplementation((key: FeatureFlagKey) =>
                key === FeatureFlagKey.AiJourneyEnabled ? false : false,
            )

            renderComponent()

            const menu = await openProductMenu(user)

            expect(
                within(menu).queryByText('AI Journey'),
            ).not.toBeInTheDocument()
        })

        it('should render AI Journey menu item when AiJourneyEnabled flag is on', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockImplementation((key: FeatureFlagKey) =>
                key === FeatureFlagKey.AiJourneyEnabled ? true : false,
            )

            renderComponent()

            const menu = await openProductMenu(user)

            expect(within(menu).getByText('AI Journey')).toBeInTheDocument()
        })

        it('should render AI Agent menu item with Upgrade badge when user has no access', async () => {
            const user = userEvent.setup()
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            renderComponent()

            const menu = await openProductMenu(user)

            expect(within(menu).getByText('Upgrade')).toBeInTheDocument()
        })

        it('should render AI Agent menu item without Upgrade badge when user has access', async () => {
            const user = userEvent.setup()
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            renderComponent()

            const menu = await openProductMenu(user)

            expect(within(menu).queryByText('Upgrade')).not.toBeInTheDocument()
        })

        it('should render Convert menu item for admin users', async () => {
            const user = userEvent.setup()

            renderComponent()

            await openProductMenu(user)

            expect(
                screen.getByRole('menuitemradio', { name: /Convert/ }),
            ).toBeInTheDocument()
        })

        it('should not render Convert menu item for non-admin users', async () => {
            const user = userEvent.setup()
            mockUseCurrentUserRole.mockReturnValue({
                isAdmin: false,
                hasRole: jest.fn().mockReturnValue(false),
                currentUser: { id: 1, role: { name: 'viewer' } },
            })

            renderComponent()

            await openProductMenu(user)

            expect(
                screen.queryByRole('menuitemradio', { name: /Convert/ }),
            ).not.toBeInTheDocument()
        })

        it('should not render AI Agent menu item when user does not have Agent role', async () => {
            const user = userEvent.setup()
            mockUseCurrentUserRole.mockReturnValue({
                isAdmin: false,
                hasRole: jest.fn().mockReturnValue(false),
                currentUser: { id: 1, role: { name: 'observer-agent' } },
            })

            renderComponent()

            const menu = await openProductMenu(user)

            expect(within(menu).queryByText('AI Agent')).not.toBeInTheDocument()
        })
    })

    describe('when sidebar is collapsed', () => {
        it('should render icon-only trigger button', () => {
            renderComponent(true)

            const triggerButton = screen.getByRole('button')
            expect(triggerButton).toBeInTheDocument()
            expect(triggerButton).not.toHaveTextContent('Inbox')
        })

        it('should render all menu items when clicked', async () => {
            const user = userEvent.setup()

            renderComponent(true)

            const menu = await openProductMenu(user)

            expectMenuItems(menu, ['Home', 'Inbox', 'Convert'])
        })
    })
})
