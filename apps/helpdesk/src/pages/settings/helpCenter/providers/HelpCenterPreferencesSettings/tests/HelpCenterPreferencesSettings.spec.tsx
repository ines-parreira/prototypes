import type { ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import axios from 'axios'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { LocaleCode } from 'models/helpCenter/types'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import * as useHelpCenterActions from 'pages/settings/helpCenter/hooks/useHelpCenterActions'
import * as helpCenterApi from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import type { HelpCenterClient } from 'rest_api/help_center_api/client'
import type { Components } from 'rest_api/help_center_api/client.generated'
import type { RootState, StoreDispatch } from 'state/types'

import { mockQueryClient } from '../../../../../../tests/reactQueryTestingUtils'
import {
    HelpCenterPreferencesSettings,
    useHelpCenterPreferencesSettings,
} from '../HelpCenterPreferencesSettings'
import * as useHelpCenterShopConnectionModule from '../useHelpCenterShopConnection'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                '1': getSingleHelpCenterResponseFixture,
            },
        },
    } as any,
    ui: { helpCenter: { currentId: 1, viewLanguage: 'fr-FR' } } as any,
}

const queryClient = mockQueryClient()

describe('HelpCenterPreferencesSettings', () => {
    let store: ReturnType<typeof mockStore>
    const deleteHelpCenterTranslationMock = jest.fn().mockResolvedValue({})
    const createHelpCenterTranslationMock = jest.fn().mockResolvedValue({})
    const mockClient: HelpCenterClient = {
        ...axios.create(),
        deleteHelpCenterTranslation: deleteHelpCenterTranslationMock,
        createHelpCenterTranslation: createHelpCenterTranslationMock,
        getUri: jest.fn(),
        request: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
        head: jest.fn(),
        options: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
    } as unknown as HelpCenterClient

    beforeEach(() => {
        store = mockStore(defaultState)
        jest.spyOn(helpCenterApi, 'useHelpCenterApi').mockReturnValue({
            client: mockClient,
            isReady: true,
        })
        jest.spyOn(
            useHelpCenterActions,
            'useHelpCenterActions',
        ).mockReturnValue({
            fetchHelpCenterTranslations: jest.fn().mockResolvedValue({}),
            getHelpCenterCustomDomain: jest.fn().mockResolvedValue({}),
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should update preferences from help center data', async () => {
        const helpCenter = {
            ...getSingleHelpCenterResponseFixture,
            default_locale: 'en-US' as LocaleCode,
            supported_locales: ['en-US', 'fr-FR'] as LocaleCode[],
            shop_name: 'Test Shop',
            shop_integration_id: 123,
            self_service_deactivated_datetime: '2024-03-20T00:00:00.000Z',
            translations: [
                {
                    locale: 'en-US' as LocaleCode,
                    seo_meta: {
                        title: 'Test Title',
                        description: 'Test Description',
                    },
                    created_datetime: '2024-03-20T00:00:00.000Z',
                    updated_datetime: '2024-03-20T00:00:00.000Z',
                    help_center_id: 1,
                    banner_text: null,
                    banner_image_vertical_offset: 0,
                    contact_info: {
                        email: {
                            email: 'test@example.com',
                            description: 'Test Email',
                            deactivated_datetime: null,
                        },
                        phone: {
                            phone_numbers: [
                                {
                                    reference: 'main',
                                    phone_number: '+1234567890',
                                },
                            ],
                            description: 'Test Phone',
                            deactivated_datetime: null,
                        },
                        chat: {
                            description: 'Test Chat',
                            deactivated_datetime: null,
                        },
                    },
                    extra_html: {
                        extra_head: '',
                        extra_head_deactivated_datetime: null,
                        custom_header: '',
                        custom_header_deactivated_datetime: null,
                        custom_footer: '',
                        custom_footer_deactivated_datetime: null,
                    },
                    chat_app_key: null,
                    contact_form_id: null,
                },
            ] as Components.Schemas.GetHelpCenterDto['translations'],
        }

        const wrapper = ({ children }: { children?: ReactNode }) => (
            <Provider store={store}>
                <CurrentHelpCenterContext.Provider value={helpCenter}>
                    <QueryClientProvider client={queryClient}>
                        <HelpCenterPreferencesSettings helpCenter={helpCenter}>
                            {children}
                        </HelpCenterPreferencesSettings>
                    </QueryClientProvider>
                </CurrentHelpCenterContext.Provider>
            </Provider>
        )

        const { result } = renderHook(
            () => useHelpCenterPreferencesSettings(),
            {
                wrapper,
            },
        )

        await waitFor(() => {
            expect(result.current).not.toBeNull()
        })

        await act(async () => {
            result.current.resetPreferences()
        })

        await waitFor(() => {
            expect(result.current.preferences).toEqual({
                defaultLanguage: 'en-US',
                availableLanguages: ['en-US', 'fr-FR'],
                seoMeta: {
                    title: 'Test Title',
                    description: 'Test Description',
                },
                connectedShop: {
                    shopName: 'Test Shop',
                    shopIntegrationId: 123,
                    selfServiceDeactivated: true,
                },
            })
        })
    })

    it('should handle connected shop change in savePreferences', async () => {
        const mockHandleShopConnectionChange = jest.fn()
        const updatedHelpCenter = {
            ...getSingleHelpCenterResponseFixture,
            shop_name: 'Updated Shop',
            shop_integration_id: 456,
        }

        mockHandleShopConnectionChange.mockResolvedValue(updatedHelpCenter)

        jest.spyOn(
            useHelpCenterShopConnectionModule,
            'useHelpCenterShopConnection',
        ).mockReturnValue({
            storeMappings: [],
            handleShopConnectionChange: mockHandleShopConnectionChange,
        })

        const helpCenter = {
            ...getSingleHelpCenterResponseFixture,
            shop_name: 'Original Shop',
            shop_integration_id: 123,
            self_service_deactivated_datetime: null,
        }

        const wrapper = ({ children }: { children?: ReactNode }) => (
            <Provider store={store}>
                <CurrentHelpCenterContext.Provider value={helpCenter}>
                    <QueryClientProvider client={queryClient}>
                        <HelpCenterPreferencesSettings helpCenter={helpCenter}>
                            {children}
                        </HelpCenterPreferencesSettings>
                    </QueryClientProvider>
                </CurrentHelpCenterContext.Provider>
            </Provider>
        )

        const { result } = renderHook(
            () => useHelpCenterPreferencesSettings(),
            {
                wrapper,
            },
        )

        await waitFor(() => {
            expect(result.current).not.toBeNull()
        })

        await act(async () => {
            result.current.updatePreferences({
                connectedShop: {
                    shopName: 'Updated Shop',
                    shopIntegrationId: 456,
                    selfServiceDeactivated: false,
                },
            })
        })

        await act(async () => {
            await result.current.savePreferences()
        })

        expect(mockHandleShopConnectionChange).toHaveBeenCalledWith({
            shopName: 'Updated Shop',
            shopIntegrationId: 456,
            selfServiceDeactivated: false,
        })

        const actions = store.getActions()
        expect(actions).toContainEqual({
            type: 'HELPCENTER/HELPCENTER_UPDATED',
            payload: updatedHelpCenter,
        })
        expect(
            actions.some(
                (action) =>
                    action.type === 'reapop/upsertNotification' &&
                    action.payload.message ===
                        'Help Center updated with success' &&
                    action.payload.status === 'success',
            ),
        ).toBe(true)
    })
})
