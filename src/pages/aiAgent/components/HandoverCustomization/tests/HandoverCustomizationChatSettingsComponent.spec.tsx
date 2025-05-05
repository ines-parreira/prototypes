import { fireEvent, screen } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { mockChatChannels } from 'pages/aiAgent/fixtures/chatChannels.fixture'
import { useHandoverCustomizationChatFallbackSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm'
import { useHandoverCustomizationChatOfflineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOfflineSettingsForm'
import { useHandoverCustomizationChatOnlineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOnlineSettingsForm'
import { useHandoverCustomizationChatSettings } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatSettings'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { HandoverCustomizationChatSettingsComponent } from '../HandoverCustomizationChatSettingsComponent'

jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatSettings',
)
jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOfflineSettingsForm',
)
jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOnlineSettingsForm',
)
jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm',
)

// Mock the imported components
jest.mock('../FormComponents/HandoverCustomizationChatOfflineSettings', () =>
    jest.fn(() => (
        <div data-testid="mock-offline-settings">mocked offline settings</div>
    )),
)
jest.mock('../FormComponents/HandoverCustomizationChatOnlineSettings', () =>
    jest.fn(() => (
        <div data-testid="mock-online-settings">mocked online settings</div>
    )),
)
jest.mock('../FormComponents/HandoverCustomizationChatFallbackSettings', () =>
    jest.fn(() => (
        <div data-testid="mock-fallback-settings">mocked fallback settings</div>
    )),
)

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

    const mockedUseHandoverCustomizationChatOfflineSettingsFormProps = {
        isLoading: false,
        isSaving: false,
        formValues: {},
        updateValue: jest.fn(),
        handleOnSave: jest.fn(),
        handleOnCancel: jest.fn(),
    }

    const mockedUseHandoverCustomizationChatOnlineSettingsFormProps = {
        isLoading: false,
        isSaving: false,
        formValues: {},
        updateValue: jest.fn(),
        handleOnSave: jest.fn(),
        handleOnCancel: jest.fn(),
    }

    const mockedUseHandoverCustomizationChatFallbackSettingsFormProps = {
        isLoading: false,
        isSaving: false,
        formValues: {},
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useHandoverCustomizationChatSettings as jest.Mock).mockReturnValue(
            mockedUseHandoverCustomizationChatSettingsProps,
        )
        ;(
            useHandoverCustomizationChatOfflineSettingsForm as jest.Mock
        ).mockReturnValue(
            mockedUseHandoverCustomizationChatOfflineSettingsFormProps,
        )
        ;(
            useHandoverCustomizationChatOnlineSettingsForm as jest.Mock
        ).mockReturnValue(
            mockedUseHandoverCustomizationChatOnlineSettingsFormProps,
        )
        ;(
            useHandoverCustomizationChatFallbackSettingsForm as jest.Mock
        ).mockReturnValue(
            mockedUseHandoverCustomizationChatFallbackSettingsFormProps,
        )
    })

    it('renders the component correctly', () => {
        renderWithStoreAndQueryClientProvider(
            <HandoverCustomizationChatSettingsComponent {...mockProps} />,
        )

        expect(useHandoverCustomizationChatSettings).toHaveBeenCalledWith(
            mockProps,
        )

        screen.getByText('Handover instructions')
        screen.getByText('When Chat is offline')
        screen.getByText('mocked offline settings')
        screen.getByText('When Chat is online')
        screen.getByText('mocked online settings')
        screen.getByText('When an error occurs')
        screen.getByText('mocked fallback settings')
    })

    it('should not render any section content when there is no integration selected to configure', () => {
        ;(useHandoverCustomizationChatSettings as jest.Mock).mockReturnValue({
            ...mockedUseHandoverCustomizationChatSettingsProps,
            selectedChat: undefined,
        })

        const props = {
            ...mockProps,
            monitoredChatIntegrationIds: [],
        }

        renderWithStoreAndQueryClientProvider(
            <HandoverCustomizationChatSettingsComponent {...props} />,
        )

        expect(useHandoverCustomizationChatSettings).toHaveBeenCalledWith(props)

        screen.queryByText(/Handover instructions/i)

        // titles should be present
        screen.getByText('When Chat is offline')
        screen.getByText('When Chat is online')
        screen.getByText('When an error occurs')

        // sections should not be rendered
        expect(screen.queryByText(/mocked offline settings/i)).toBeNull()
        expect(screen.queryByText(/mocked online settings/i)).toBeNull()
        expect(screen.queryByText(/mocked fallback settings/i)).toBeNull()
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

            renderWithStoreAndQueryClientProvider(
                <HandoverCustomizationChatSettingsComponent {...props} />,
            )

            expect(useHandoverCustomizationChatSettings).toHaveBeenCalledWith(
                props,
            )

            expect(screen.queryByText('26 Shopify Chat')).toBeNull()
            expect(screen.queryByRole('textbox')).toBeNull()
        })

        it('should render the chat selection if there is more than one chat channel', () => {
            renderWithStoreAndQueryClientProvider(
                <HandoverCustomizationChatSettingsComponent
                    {...mockProps}
                    monitoredChatIntegrationIds={[14, 15]}
                />,
            )

            screen.getByText('26 Shopify Chat')
            screen.getByRole('textbox')
        })
    })

    describe('Handover customization settings', () => {
        describe('without settings revamp', () => {
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

                renderWithStoreAndQueryClientProvider(
                    <HandoverCustomizationChatSettingsComponent {...props} />,
                )

                expect(
                    useHandoverCustomizationChatSettings,
                ).toHaveBeenCalledWith(props)

                // sections should not be rendered
                screen.getByText(/mocked offline settings/i)
                screen.getByText(/mocked online settings/i)
                screen.getByText(/mocked fallback settings/i)
            })

            it('should render the handover customization settings when there are more than one chat channel', () => {
                const props = {
                    ...mockProps,
                    monitoredChatIntegrationIds: [14, 15],
                }

                renderWithStoreAndQueryClientProvider(
                    <HandoverCustomizationChatSettingsComponent {...props} />,
                )

                expect(
                    useHandoverCustomizationChatSettings,
                ).toHaveBeenCalledWith(props)

                // sections should be rendered
                screen.getByText(/mocked offline settings/i)
                screen.getByText(/mocked online settings/i)
                screen.getByText(/mocked fallback settings/i)
            })
        })

        describe('with settings revamp', () => {
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
                ;(useFlags as jest.Mock).mockReturnValue({
                    [FeatureFlagKey.AiAgentSettingsRevamp]: true,
                })
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

                renderWithStoreAndQueryClientProvider(
                    <HandoverCustomizationChatSettingsComponent {...props} />,
                )

                expect(
                    useHandoverCustomizationChatSettings,
                ).toHaveBeenCalledWith(props)

                expect(getChatOfflineRow()).toBeInTheDocument()
                expect(getChatOnlineRow()).toBeInTheDocument()
                expect(getChatErrorRow()).toBeInTheDocument()
            })

            it('should render the handover customization settings when there are more than one chat channel', () => {
                const props = {
                    ...mockProps,
                    monitoredChatIntegrationIds: [14, 15],
                }

                renderWithStoreAndQueryClientProvider(
                    <HandoverCustomizationChatSettingsComponent {...props} />,
                )

                expect(
                    useHandoverCustomizationChatSettings,
                ).toHaveBeenCalledWith(props)

                expect(getChatOfflineRow()).toBeInTheDocument()
                expect(getChatOnlineRow()).toBeInTheDocument()
                expect(getChatErrorRow()).toBeInTheDocument()
            })

            it('should render the chat options in the handover instructions when there are more than one chat channel', () => {
                const props = {
                    ...mockProps,
                    monitoredChatIntegrationIds: [14, 15],
                }

                renderWithStoreAndQueryClientProvider(
                    <HandoverCustomizationChatSettingsComponent {...props} />,
                )

                expect(
                    useHandoverCustomizationChatSettings,
                ).toHaveBeenCalledWith(props)

                expect(screen.getByText('26 Shopify Chat')).toBeInTheDocument()
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            it('should open drawer when clicking on offline chat row', () => {
                const props = {
                    ...mockProps,
                    monitoredChatIntegrationIds: [14],
                }

                renderWithStoreAndQueryClientProvider(
                    <HandoverCustomizationChatSettingsComponent {...props} />,
                )

                expect(
                    useHandoverCustomizationChatSettings,
                ).toHaveBeenCalledWith(props)

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

                renderWithStoreAndQueryClientProvider(
                    <HandoverCustomizationChatSettingsComponent {...props} />,
                )

                expect(
                    useHandoverCustomizationChatSettings,
                ).toHaveBeenCalledWith(props)

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

                renderWithStoreAndQueryClientProvider(
                    <HandoverCustomizationChatSettingsComponent {...props} />,
                )

                expect(
                    useHandoverCustomizationChatSettings,
                ).toHaveBeenCalledWith(props)

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

                renderWithStoreAndQueryClientProvider(
                    <HandoverCustomizationChatSettingsComponent
                        {...mockProps}
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

                renderWithStoreAndQueryClientProvider(
                    <HandoverCustomizationChatSettingsComponent
                        {...mockProps}
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

                renderWithStoreAndQueryClientProvider(
                    <HandoverCustomizationChatSettingsComponent
                        {...mockProps}
                    />,
                )
                fireEvent.click(getChatErrorRow())

                expect(getChatErrorDrawerTitle()).toBeUndefined()
            })

            it('should close drawer when clicking on cancel button', () => {
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

                renderWithStoreAndQueryClientProvider(
                    <HandoverCustomizationChatSettingsComponent {...props} />,
                )

                expect(
                    useHandoverCustomizationChatSettings,
                ).toHaveBeenCalledWith(props)

                fireEvent.click(getChatOfflineRow())

                const drawerTitle = getChatOfflineDrawerTitle()
                expect(drawerTitle).toBeVisible()

                fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
                expect(drawerTitle).not.toBeVisible()
            })
        })
    })
})
