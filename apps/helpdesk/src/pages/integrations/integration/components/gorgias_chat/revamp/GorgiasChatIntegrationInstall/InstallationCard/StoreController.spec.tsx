import { act, render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { ButtonIntent, ButtonVariant } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/types'

import StoreController from './StoreController'

const mockButton = jest.fn((__props: any) => null)
const mockStoreNameDropdown = jest.fn((__props: any) => null)
const mockDisconnectStoreModal = jest.fn((__props: any) => null)

const mockDispatch = jest.fn()
const mockUseAppDispatch = jest.fn(() => mockDispatch)
const mockUseAppSelector = jest.fn((__selector) => [])
const mockUseAsyncFn = jest.fn((fn: any) => [{ loading: false }, fn])

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Button: (props: any) => mockButton(props),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/StoreNameDropdown',
    () => ({
        StoreNameDropdown: (props: any) => mockStoreNameDropdown(props),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/InstallationCard/DisconnectStoreModal',
    () => ({
        __esModule: true,
        default: (props: any) => mockDisconnectStoreModal(props),
    }),
)

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => mockUseAppDispatch(),
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: (selector: any) => mockUseAppSelector(selector),
}))

jest.mock('@repo/hooks', () => ({
    useAsyncFn: (fn: any) => mockUseAsyncFn(fn),
}))

jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: jest.fn((form: any) => ({
        type: 'UPDATE_INTEGRATION',
        payload: form,
    })),
}))

jest.mock('state/integrations/selectors', () => ({
    getIntegrationsByType: jest.fn(() => jest.fn()),
}))

jest.mock('models/selfServiceConfiguration/utils', () => ({
    getShopNameFromStoreIntegration: jest.fn(
        (storeIntegration: any) => storeIntegration.shop,
    ),
}))

describe('StoreController', () => {
    const mockStoreIntegration = {
        id: 1,
        type: IntegrationType.Shopify,
        shop: 'test-shop.myshopify.com',
    }

    const mockStoreIntegrations = [
        mockStoreIntegration,
        {
            id: 2,
            type: IntegrationType.Shopify,
            shop: 'another-shop.myshopify.com',
        },
    ]

    const defaultIntegration = fromJS({
        id: 100,
        type: IntegrationType.GorgiasChat,
        meta: {
            shop_name: 'test-shop.myshopify.com',
            shop_type: IntegrationType.Shopify,
            shop_integration_id: 1,
            shopify_integration_ids: [],
        },
    })

    const defaultProps: any = {
        integration: defaultIntegration,
        storeIntegration: mockStoreIntegration,
        storeIntegrations: mockStoreIntegrations,
        isOneClickInstallation: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAsyncFn.mockImplementation((fn: any) => [{ loading: false }, fn])
    })

    const renderComponent = (props = {}) => {
        return render(<StoreController {...defaultProps} {...props} />)
    }

    describe('StoreNameDropdown', () => {
        it('should render StoreNameDropdown with correct props', () => {
            renderComponent()

            expect(mockStoreNameDropdown).toHaveBeenCalledWith(
                expect.objectContaining({
                    storeIntegrationId: mockStoreIntegration.id,
                    isDisabled: true,
                }),
            )
        })

        it('should pass onChange handler to StoreNameDropdown', () => {
            renderComponent()

            expect(mockStoreNameDropdown).toHaveBeenCalledWith(
                expect.objectContaining({
                    onChange: expect.any(Function),
                }),
            )
        })

        it('should enable dropdown when no store is connected', () => {
            renderComponent({
                storeIntegration: undefined,
            })

            expect(mockStoreNameDropdown).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDisabled: false,
                }),
            )
        })
    })

    describe('DisconnectStoreModal', () => {
        it('should render DisconnectStoreModal with correct props', () => {
            renderComponent()

            expect(mockDisconnectStoreModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOpen: false,
                    isDisconnectPending: false,
                    isOneClickInstallation: false,
                }),
            )
        })

        it('should pass onOpenChange handler', () => {
            renderComponent()

            expect(mockDisconnectStoreModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    onOpenChange: expect.any(Function),
                }),
            )
        })

        it('should pass onDisconnect handler', () => {
            renderComponent()

            expect(mockDisconnectStoreModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    onDisconnect: expect.any(Function),
                }),
            )
        })

        it('should pass isOneClickInstallation prop', () => {
            renderComponent({ isOneClickInstallation: true })

            expect(mockDisconnectStoreModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOneClickInstallation: true,
                }),
            )
        })
    })

    describe('Buttons when store is connected', () => {
        it('should render Change button', () => {
            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const changeButton = buttonCalls.find(
                (call) => call[0].children === 'Change',
            )

            expect(changeButton).toBeDefined()
            expect(changeButton[0].variant).toBe(ButtonVariant.Primary)
            expect(changeButton[0].intent).toBe(ButtonIntent.Regular)
        })

        it('should render Disconnect button', () => {
            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const disconnectButton = buttonCalls.find(
                (call) => call[0].children === 'Disconnect',
            )

            expect(disconnectButton).toBeDefined()
            expect(disconnectButton[0].intent).toBe(ButtonIntent.Destructive)
            expect(disconnectButton[0].variant).toBe(ButtonVariant.Tertiary)
        })

        it('should open disconnect modal when Disconnect button is clicked', () => {
            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const disconnectButton = buttonCalls.find(
                (call) => call[0].children === 'Disconnect',
            )

            act(() => {
                disconnectButton[0].onClick()
            })

            const modalCalls = mockDisconnectStoreModal.mock.calls as any[]
            const lastModalCall = modalCalls[modalCalls.length - 1]

            expect(lastModalCall[0].isOpen).toBe(true)
        })

        it('should enable dropdown when Change button is clicked', () => {
            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const changeButton = buttonCalls.find(
                (call) => call[0].children === 'Change',
            )

            act(() => {
                changeButton[0].onClick()
            })

            const dropdownCalls = mockStoreNameDropdown.mock.calls as any[]
            const lastDropdownCall = dropdownCalls[dropdownCalls.length - 1]

            expect(lastDropdownCall[0].isDisabled).toBe(false)
        })
    })

    describe('Buttons when no store is connected', () => {
        it('should render Connect store button', () => {
            renderComponent({ storeIntegration: undefined })

            const buttonCalls = mockButton.mock.calls as any[]
            const connectButton = buttonCalls.find(
                (call) => call[0].children === 'Connect store',
            )

            expect(connectButton).toBeDefined()
        })

        it('should disable Connect store button when no store is selected', () => {
            renderComponent({ storeIntegration: undefined })

            const buttonCalls = mockButton.mock.calls as any[]
            const connectButton = buttonCalls.find(
                (call) => call[0].children === 'Connect store',
            )

            expect(connectButton[0].isDisabled).toBe(true)
        })

        it('should not render Cancel button when no previous store', () => {
            renderComponent({ storeIntegration: undefined })

            const buttonCalls = mockButton.mock.calls as any[]
            const cancelButton = buttonCalls.find(
                (call) => call[0].children === 'Cancel',
            )

            expect(cancelButton).toBeUndefined()
        })
    })

    describe('Buttons when changing store', () => {
        it('should render Cancel button when changing store', () => {
            renderComponent()

            const changeButton = mockButton.mock.calls.find(
                (call: any) => call[0].children === 'Change',
            )

            act(() => {
                changeButton![0].onClick()
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const cancelButton = buttonCalls.find(
                (call) => call[0].children === 'Cancel',
            )

            expect(cancelButton).toBeDefined()
            expect(cancelButton[0].intent).toBe(ButtonIntent.Regular)
            expect(cancelButton[0].variant).toBe(ButtonVariant.Secondary)
        })

        it('should render Connect store button when changing store', () => {
            renderComponent()

            const changeButton = mockButton.mock.calls.find(
                (call: any) => call[0].children === 'Change',
            )

            act(() => {
                changeButton![0].onClick()
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const connectButton = buttonCalls.find(
                (call) => call[0].children === 'Connect store',
            )

            expect(connectButton).toBeDefined()
        })

        it('should disable Connect store button when selection is not dirty', () => {
            renderComponent()

            const changeButton = mockButton.mock.calls.find(
                (call: any) => call[0].children === 'Change',
            )

            act(() => {
                changeButton![0].onClick()
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const connectButton = buttonCalls.find(
                (call) => call[0].children === 'Connect store',
            )

            expect(connectButton[0].isDisabled).toBe(true)
        })

        it('should return to connected state when Cancel is clicked', () => {
            renderComponent()

            const changeButton = mockButton.mock.calls.find(
                (call: any) => call[0].children === 'Change',
            )

            act(() => {
                changeButton![0].onClick()
            })

            const cancelButton = mockButton.mock.calls.find(
                (call: any) => call[0].children === 'Cancel',
            )

            act(() => {
                cancelButton![0].onClick()
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const newChangeButton = buttonCalls.find(
                (call) => call[0].children === 'Change',
            )

            expect(newChangeButton).toBeDefined()
        })
    })

    describe('Loading states', () => {
        it('should show loading on Connect store button when connecting', () => {
            mockUseAsyncFn.mockImplementation((fn: any) => [
                { loading: true },
                fn,
            ])

            renderComponent({ storeIntegration: undefined })

            const buttonCalls = mockButton.mock.calls as any[]
            const connectButton = buttonCalls.find(
                (call) => call[0].children === 'Connect store',
            )

            expect(connectButton[0].isLoading).toBe(true)
        })

        it('should disable Cancel button when connecting', () => {
            mockUseAsyncFn.mockImplementation((fn: any) => [
                { loading: true },
                fn,
            ])

            renderComponent()

            const changeButton = mockButton.mock.calls.find(
                (call: any) => call[0].children === 'Change',
            )

            act(() => {
                changeButton![0].onClick()
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const cancelButton = buttonCalls.find(
                (call) => call[0].children === 'Cancel',
            )

            expect(cancelButton[0].isDisabled).toBe(true)
        })

        it('should disable dropdown when connecting', () => {
            mockUseAsyncFn.mockImplementation((fn: any) => [
                { loading: true },
                fn,
            ])

            renderComponent({ storeIntegration: undefined })

            const dropdownCalls = mockStoreNameDropdown.mock.calls as any[]
            const lastCall = dropdownCalls[dropdownCalls.length - 1]

            expect(lastCall[0].isDisabled).toBe(true)
        })
    })
})
