import { render, userEvent } from '@repo/testing'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'

import { mockChatChannels } from 'pages/aiAgent/fixtures/chatChannels.fixture'
import { useHandoverCustomizationChatSettings } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatSettings'

import { HandoverCustomizationChatSettingsComponent } from '../HandoverCustomizationChatSettingsComponent'

jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatSettings',
)

jest.mock('../FormComponents/HandoverCustomizationChatSettingsDrawer', () => {
    const TITLES = {
        error: 'When an error occurs',
        offline: 'When Chat is offline',
        online: 'When Chat is online',
    } as const

    type MockDrawerProps = {
        activeContent: keyof typeof TITLES
        onClose: () => void
        open: boolean
    }

    return {
        __esModule: true,
        default: ({ activeContent, onClose, open }: MockDrawerProps) =>
            open ? (
                <div
                    className="drawer-container"
                    style={{ zIndex: 20 }}
                    data-testid="mock-handover-settings-drawer"
                >
                    <div>{TITLES[activeContent]}</div>
                    <input aria-label="drawer-input" />
                    <button onClick={onClose} type="button">
                        Cancel
                    </button>
                </div>
            ) : null,
    }
})

const getRow = (title: string) => {
    return screen.getByTestId(
        `settings-feature-row-${title.toLowerCase().replace(/\s+/g, '-')}`,
    )
}

describe('HandoverCustomizationChatSettingsComponent', () => {
    const mockProps = {
        shopName: 'test-shop',
        shopType: 'shopify',
        monitoredChatIntegrationIds: [14, 15],
    }

    const mockedOnSelectedChatChange = jest.fn()
    const mockedOnActiveSettingsSectionChange = jest.fn()

    const mockedUseHandoverCustomizationChatSettingsProps = {
        availableChats: mockChatChannels,
        selectedChat: mockChatChannels[0],
        onSelectedChatChange: mockedOnSelectedChatChange,
        onActiveSettingsSectionChange: mockedOnActiveSettingsSectionChange,
        activeSettingsSection: undefined,
        isHandoverSectionDisabled: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useHandoverCustomizationChatSettings as jest.Mock).mockReturnValue(
            mockedUseHandoverCustomizationChatSettingsProps,
        )
    })

    it('renders the component correctly', () => {
        render(
            <HandoverCustomizationChatSettingsComponent
                {...mockProps}
                setIsFormDirty={() => jest.fn()}
            />,
        )

        expect(useHandoverCustomizationChatSettings).toHaveBeenCalledWith(
            mockProps,
        )

        expect(screen.getByText('Handover instructions')).toBeInTheDocument()
        expect(screen.getByText('When Chat is offline')).toBeInTheDocument()
        expect(screen.getByText('When Chat is online')).toBeInTheDocument()
        expect(screen.getByText('When an error occurs')).toBeInTheDocument()
    })

    it('should not render any section content when there is no integration selected to configure', async () => {
        ;(useHandoverCustomizationChatSettings as jest.Mock).mockReturnValue({
            ...mockedUseHandoverCustomizationChatSettingsProps,
            selectedChat: undefined,
            isHandoverSectionDisabled: true,
        })

        const props = {
            ...mockProps,
            monitoredChatIntegrationIds: [],
        }

        render(
            <HandoverCustomizationChatSettingsComponent
                {...props}
                setIsFormDirty={() => jest.fn()}
            />,
        )

        expect(useHandoverCustomizationChatSettings).toHaveBeenCalledWith(props)

        const offlineRow = getRow('When Chat is offline')
        const onlineRow = getRow('When Chat is online')
        const errorRow = getRow('When an error occurs')

        // titles should be present
        expect(offlineRow).toBeInTheDocument()
        expect(onlineRow).toBeInTheDocument()
        expect(errorRow).toBeInTheDocument()

        // buttons should be disabled
        expect(within(offlineRow).getByRole('button')).toBeAriaDisabled()
        expect(within(onlineRow).getByRole('button')).toBeAriaDisabled()
        expect(within(errorRow).getByRole('button')).toBeAriaDisabled()
    })

    describe('Chat selection', () => {
        it('should not render the chat selection if there is one chat channel', () => {
            ;(
                useHandoverCustomizationChatSettings as jest.Mock
            ).mockReturnValue({
                ...mockedUseHandoverCustomizationChatSettingsProps,
                availableChats: [mockChatChannels[0]],
                selectedChat: mockChatChannels[0],
            })

            const props = {
                ...mockProps,
                monitoredChatIntegrationIds: [14],
            }

            render(
                <HandoverCustomizationChatSettingsComponent
                    {...props}
                    setIsFormDirty={() => jest.fn()}
                />,
            )

            expect(useHandoverCustomizationChatSettings).toHaveBeenCalledWith(
                props,
            )

            expect(screen.queryByText('26 Shopify Chat')).toBeNull()
            expect(screen.queryByRole('textbox')).toBeNull()
        })

        it('should render the chat selection if there is more than one chat channel', () => {
            render(
                <HandoverCustomizationChatSettingsComponent
                    {...mockProps}
                    monitoredChatIntegrationIds={[14, 15]}
                    setIsFormDirty={() => jest.fn()}
                />,
            )

            screen.getByText('26 Shopify Chat')
            screen.getByRole('textbox')
        })
    })

    describe('Handover customization settings', () => {
        const getChatOfflineRow = () => {
            return screen.getAllByText(/When Chat is offline/i)[0]
        }
        const getChatOfflineDrawerTitle = () => {
            return screen.getAllByText(/When Chat is offline/i)[1]
        }
        const getChatOnlineRow = () => {
            return screen.getAllByText(/When Chat is online/i)[0]
        }
        const getChatOnlineDrawerTitle = () => {
            return screen.getAllByText(/When Chat is online/i)[1]
        }
        const getChatErrorRow = () => {
            return screen.getAllByText(/When an error occurs/i)[0]
        }
        const getChatErrorDrawerTitle = () => {
            return screen.getAllByText(/When an error occurs/i)[1]
        }

        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should render the handover customization settings when there is one chat channel', () => {
            ;(
                useHandoverCustomizationChatSettings as jest.Mock
            ).mockReturnValue({
                ...mockedUseHandoverCustomizationChatSettingsProps,
                availableChats: [mockChatChannels[0]],
                selectedChat: mockChatChannels[0],
            })

            const props = {
                ...mockProps,
                monitoredChatIntegrationIds: [14],
            }

            render(
                <HandoverCustomizationChatSettingsComponent
                    {...props}
                    setIsFormDirty={() => jest.fn()}
                />,
            )

            expect(getChatOfflineRow()).toBeInTheDocument()
            expect(getChatOnlineRow()).toBeInTheDocument()
            expect(getChatErrorRow()).toBeInTheDocument()
        })

        it('should render the handover customization settings when there are more than one chat channel', () => {
            const props = {
                ...mockProps,
                monitoredChatIntegrationIds: [14, 15],
            }

            render(
                <HandoverCustomizationChatSettingsComponent
                    {...props}
                    setIsFormDirty={() => jest.fn()}
                />,
            )

            expect(getChatOfflineRow()).toBeInTheDocument()
            expect(getChatOnlineRow()).toBeInTheDocument()
            expect(getChatErrorRow()).toBeInTheDocument()
        })

        it('should render the chat options in the handover instructions when there are more than one chat channel', () => {
            const props = {
                ...mockProps,
                monitoredChatIntegrationIds: [14, 15],
            }

            render(
                <HandoverCustomizationChatSettingsComponent
                    {...props}
                    setIsFormDirty={() => jest.fn()}
                />,
            )

            expect(screen.getByText('26 Shopify Chat')).toBeInTheDocument()
            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        it('should open drawer when clicking on offline chat row', () => {
            const props = {
                ...mockProps,
                monitoredChatIntegrationIds: [14],
            }

            render(
                <HandoverCustomizationChatSettingsComponent
                    {...props}
                    setIsFormDirty={() => jest.fn()}
                />,
            )

            fireEvent.click(getChatOfflineRow())

            const drawerTitle = getChatOfflineDrawerTitle()

            expect(drawerTitle).toBeInTheDocument()
            expect(drawerTitle.closest('.drawer-container')).toHaveStyle(
                'z-index: 20',
            )
        })

        it('should open drawer when clicking on online chat row', () => {
            const props = {
                ...mockProps,
                monitoredChatIntegrationIds: [14],
            }

            render(
                <HandoverCustomizationChatSettingsComponent
                    {...props}
                    setIsFormDirty={() => jest.fn()}
                />,
            )

            fireEvent.click(getChatOnlineRow())

            const drawerTitle = getChatOnlineDrawerTitle()

            expect(drawerTitle).toBeInTheDocument()
            expect(drawerTitle.closest('.drawer-container')).toHaveStyle(
                'z-index: 20',
            )
        })

        it('should open drawer when clicking on error occurs row', () => {
            const props = {
                ...mockProps,
                monitoredChatIntegrationIds: [14],
            }

            render(
                <HandoverCustomizationChatSettingsComponent
                    {...props}
                    setIsFormDirty={() => jest.fn()}
                />,
            )

            fireEvent.click(getChatErrorRow())

            const drawerTitle = getChatErrorDrawerTitle()

            expect(drawerTitle).toBeInTheDocument()
            expect(drawerTitle.closest('.drawer-container')).toHaveStyle(
                'z-index: 20',
            )
        })

        it('should not open drawer when clicking on offline chat row disabled', () => {
            ;(
                useHandoverCustomizationChatSettings as jest.Mock
            ).mockReturnValue({
                ...mockedUseHandoverCustomizationChatSettingsProps,
                selectedChat: [],
                isHandoverSectionDisabled: true,
            })

            render(
                <HandoverCustomizationChatSettingsComponent
                    {...mockProps}
                    setIsFormDirty={() => jest.fn()}
                />,
            )
            fireEvent.click(getChatOfflineRow())

            expect(getChatOfflineDrawerTitle()).toBeUndefined()
        })

        it('should not open drawer when clicking on online chat row disabled', () => {
            ;(
                useHandoverCustomizationChatSettings as jest.Mock
            ).mockReturnValue({
                ...mockedUseHandoverCustomizationChatSettingsProps,
                selectedChat: [],
                isHandoverSectionDisabled: true,
            })

            render(
                <HandoverCustomizationChatSettingsComponent
                    {...mockProps}
                    setIsFormDirty={() => jest.fn()}
                />,
            )
            fireEvent.click(getChatOnlineRow())

            expect(getChatOnlineDrawerTitle()).toBeUndefined()
        })

        it('should not open drawer when clicking on error occurs row disabled', () => {
            ;(
                useHandoverCustomizationChatSettings as jest.Mock
            ).mockReturnValue({
                ...mockedUseHandoverCustomizationChatSettingsProps,
                selectedChat: [],
                isHandoverSectionDisabled: true,
            })

            render(
                <HandoverCustomizationChatSettingsComponent
                    {...mockProps}
                    setIsFormDirty={() => jest.fn()}
                />,
            )
            fireEvent.click(getChatErrorRow())

            expect(getChatErrorDrawerTitle()).toBeUndefined()
        })

        it('should close drawer when clicking on cancel button', async () => {
            ;(
                useHandoverCustomizationChatSettings as jest.Mock
            ).mockReturnValue({
                ...mockedUseHandoverCustomizationChatSettingsProps,
                availableChats: [mockChatChannels[0]],
                selectedChat: mockChatChannels[0],
            })

            const props = {
                ...mockProps,
                monitoredChatIntegrationIds: [14],
            }

            render(
                <HandoverCustomizationChatSettingsComponent
                    {...props}
                    setIsFormDirty={() => jest.fn()}
                />,
            )

            fireEvent.click(getChatOfflineRow())

            const drawerTitle = getChatOfflineDrawerTitle()
            expect(drawerTitle).toBeVisible()

            fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
            jest.advanceTimersByTime(300)

            await waitFor(() => {
                expect(drawerTitle).not.toBeVisible()
            })
        })

        it('should close drawer when clicking on cancel button if there are changes', async () => {
            render(
                <HandoverCustomizationChatSettingsComponent
                    {...mockProps}
                    setIsFormDirty={() => jest.fn()}
                />,
            )

            fireEvent.click(getChatOfflineRow())
            await userEvent.type(screen.getAllByRole('textbox')[0], 'test')

            const drawerTitle = getChatOfflineDrawerTitle()

            expect(drawerTitle).toBeVisible()

            fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
            jest.advanceTimersByTime(300)

            await waitFor(() => {
                expect(drawerTitle).not.toBeVisible()
            })
        })
    })

    it('renders chat handover behavior link with correct URL', () => {
        render(
            <HandoverCustomizationChatSettingsComponent
                {...mockProps}
                setIsFormDirty={() => jest.fn()}
            />,
        )

        const link = screen.getByText(/Chat's handover behavior/i)
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
            'href',
            'https://docs.gorgias.com/en-US/customize-how-ai-agent-hands-over-to-your-team-6008591',
        )
        expect(link).toHaveAttribute('target', '_blank')
    })
})
