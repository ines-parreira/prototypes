import { SidebarContext } from '@repo/navigation'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SidebarProductHeader } from '../SidebarProductHeader'

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
    })

    describe('when sidebar is expanded', () => {
        it('should render trigger button with selected item name', () => {
            const selectedItem = {
                name: 'Inbox',
                icon: 'comm-chat-conversation-circle',
            }

            render(<SidebarProductHeader selectedItem={selectedItem} />, {
                wrapper,
            })

            const triggerButton = screen.getByRole('button', { name: /Inbox/i })
            expect(triggerButton).toBeInTheDocument()
        })

        it('should render all menu items when clicked', async () => {
            const user = userEvent.setup()
            const selectedItem = {
                name: 'Inbox',
                icon: 'comm-chat-conversation-circle',
            }

            render(<SidebarProductHeader selectedItem={selectedItem} />, {
                wrapper,
            })

            const triggerButton = screen.getByRole('button', { name: /Inbox/i })

            await act(() => user.click(triggerButton))

            expect(
                screen.getByRole('menuitem', { name: /Inbox/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /AI Agent/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Marketing/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Analytics/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Workflows/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /Customers/ }),
            ).toBeInTheDocument()
        })
    })

    describe('when sidebar is collapsed', () => {
        it('should render icon-only trigger button', () => {
            const selectedItem = {
                name: 'Inbox',
                icon: 'comm-chat-conversation-circle',
            }

            render(<SidebarProductHeader selectedItem={selectedItem} />, {
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
            })

            const triggerButton = screen.getByRole('button')
            expect(triggerButton).toBeInTheDocument()
            expect(triggerButton).not.toHaveTextContent('Inbox')
        })

        it('should render all menu items when clicked', async () => {
            const user = userEvent.setup()
            const selectedItem = {
                name: 'Inbox',
                icon: 'comm-chat-conversation-circle',
            }

            render(<SidebarProductHeader selectedItem={selectedItem} />, {
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
            })

            const triggerButton = screen.getByRole('button')

            await act(() => user.click(triggerButton))

            expect(
                screen.getByRole('menuitem', { name: /Inbox/ }),
            ).toBeInTheDocument()
        })
    })
})
