import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { SidebarContext } from '@repo/navigation'
import { assumeMock } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { Product, productConfig } from 'routes/layout/productConfig'

import { SidebarProductHeader } from '../SidebarProductHeader'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

const mockUseFlag = assumeMock(useFlag)
const mockUseAiAgentAccess = assumeMock(useAiAgentAccess)

const mockToggleCollapse = jest.fn()

const wrapper = ({ children }: any) => (
    <SidebarContext.Provider
        value={{ isCollapsed: false, toggleCollapse: mockToggleCollapse }}
    >
        {children}
    </SidebarContext.Provider>
)

describe('SidebarProductHeader', () => {
    beforeEach(() => {
        mockToggleCollapse.mockClear()
        mockUseFlag.mockReturnValue(false)
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })

    describe('when sidebar is expanded', () => {
        it('should render trigger button with selected item name', () => {
            render(
                <SidebarProductHeader
                    selectedItem={productConfig[Product.Inbox]}
                />,
                { wrapper },
            )

            const triggerButton = screen.getByRole('button', { name: /Inbox/i })
            expect(triggerButton).toBeInTheDocument()
        })

        it('should render core menu items when clicked', async () => {
            const user = userEvent.setup()

            render(
                <SidebarProductHeader
                    selectedItem={productConfig[Product.Inbox]}
                />,
                { wrapper },
            )

            const triggerButton = screen.getByRole('button', { name: /Inbox/i })

            await act(() => user.click(triggerButton))

            expect(
                screen.getByRole('menuitemradio', { name: /Home/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitemradio', { name: /Inbox/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitemradio', { name: /AI Agent/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitemradio', { name: /Analytics/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitemradio', { name: /Workflows/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitemradio', { name: /Customers/ }),
            ).toBeInTheDocument()
        })

        it('should not render Marketing menu item when AiJourneyEnabled flag is off', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockImplementation((key: FeatureFlagKey) =>
                key === FeatureFlagKey.AiJourneyEnabled ? false : false,
            )

            render(
                <SidebarProductHeader
                    selectedItem={productConfig[Product.Inbox]}
                />,
                { wrapper },
            )

            const triggerButton = screen.getByRole('button', { name: /Inbox/i })
            await act(() => user.click(triggerButton))

            expect(
                screen.queryByRole('menuitemradio', { name: /Marketing/ }),
            ).not.toBeInTheDocument()
        })

        it('should render Marketing menu item when AiJourneyEnabled flag is on', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockImplementation((key: FeatureFlagKey) =>
                key === FeatureFlagKey.AiJourneyEnabled ? true : false,
            )

            render(
                <SidebarProductHeader
                    selectedItem={productConfig[Product.Inbox]}
                />,
                { wrapper },
            )

            const triggerButton = screen.getByRole('button', { name: /Inbox/i })
            await act(() => user.click(triggerButton))

            expect(
                screen.getByRole('menuitemradio', { name: /Marketing/ }),
            ).toBeInTheDocument()
        })

        it('should render AI Agent menu item with Upgrade badge when user has no access', async () => {
            const user = userEvent.setup()
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            render(
                <SidebarProductHeader
                    selectedItem={productConfig[Product.Inbox]}
                />,
                { wrapper },
            )

            const triggerButton = screen.getByRole('button', { name: /Inbox/i })
            await act(() => user.click(triggerButton))

            expect(screen.getByText('Upgrade')).toBeInTheDocument()
        })

        it('should render AI Agent menu item without Upgrade badge when user has access', async () => {
            const user = userEvent.setup()
            mockUseAiAgentAccess.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            render(
                <SidebarProductHeader
                    selectedItem={productConfig[Product.Inbox]}
                />,
                { wrapper },
            )

            const triggerButton = screen.getByRole('button', { name: /Inbox/i })
            await act(() => user.click(triggerButton))

            expect(screen.queryByText('Upgrade')).not.toBeInTheDocument()
        })
    })

    describe('when sidebar is collapsed', () => {
        it('should render icon-only trigger button', () => {
            render(
                <SidebarProductHeader
                    selectedItem={productConfig[Product.Inbox]}
                />,
                {
                    wrapper: ({ children }) => (
                        <SidebarContext.Provider
                            value={{
                                isCollapsed: true,
                                toggleCollapse: mockToggleCollapse,
                            }}
                        >
                            {children}
                        </SidebarContext.Provider>
                    ),
                },
            )

            const triggerButton = screen.getByRole('button')
            expect(triggerButton).toBeInTheDocument()
            expect(triggerButton).not.toHaveTextContent('Inbox')
        })

        it('should render all menu items when clicked', async () => {
            const user = userEvent.setup()

            render(
                <SidebarProductHeader
                    selectedItem={productConfig[Product.Inbox]}
                />,
                {
                    wrapper: ({ children }) => (
                        <SidebarContext.Provider
                            value={{
                                isCollapsed: true,
                                toggleCollapse: mockToggleCollapse,
                            }}
                        >
                            {children}
                        </SidebarContext.Provider>
                    ),
                },
            )

            const triggerButton = screen.getByRole('button')

            await act(() => user.click(triggerButton))

            expect(
                screen.getByRole('menuitemradio', { name: /Home/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitemradio', { name: /Inbox/ }),
            ).toBeInTheDocument()
        })
    })
})
