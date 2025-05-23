import { ReactNode } from 'react'

import { act } from '@testing-library/react'
import axios from 'axios'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { LocaleCode } from 'models/helpCenter/types'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import * as helpCenterApi from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { HelpCenterClient } from 'rest_api/help_center_api/client'
import { RootState, StoreDispatch } from 'state/types'
import { renderHook } from 'utils/testing/renderHook'

import {
    HelpCenterPreferencesSettings,
    useHelpCenterPreferencesSettings,
} from '../HelpCenterPreferencesSettings'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([])

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
                    banner_url: null,
                    banner_alt: null,
                    banner_title: null,
                    banner_link: null,
                    banner_link_text: null,
                    banner_link_target: null,
                    banner_link_rel: null,
                    banner_image_vertical_offset: 0,
                    contact_info: {
                        email: {
                            email: 'test@example.com',
                            enabled: true,
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
                            enabled: true,
                            description: 'Test Phone',
                            deactivated_datetime: null,
                        },
                        chat: {
                            enabled: true,
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
            ],
        }

        let preferencesResult: any

        await act(async () => {
            const { result } = renderHook(
                () => useHelpCenterPreferencesSettings(),
                {
                    wrapper: ({ children }: { children?: ReactNode }) => (
                        <Provider store={store}>
                            <CurrentHelpCenterContext.Provider
                                value={helpCenter}
                            >
                                <HelpCenterPreferencesSettings
                                    helpCenter={helpCenter}
                                >
                                    {children}
                                </HelpCenterPreferencesSettings>
                            </CurrentHelpCenterContext.Provider>
                        </Provider>
                    ),
                },
            )

            // Call resetPreferences which internally calls updatePreferencesFromData
            result.current.resetPreferences()
            preferencesResult = result.current.preferences
        })

        // Verify that preferences were updated correctly
        expect(preferencesResult).toEqual({
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
