import type { ComponentProps } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT } from 'config/integrations/gorgias_chat'
import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import { entitiesInitialState } from 'fixtures/entities'
import { user } from 'fixtures/users'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import type * as IntegrationsActions from 'state/integrations/actions'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { GorgiasChatIntegrationAppearanceComponent } from '../GorgiasChatIntegrationAppearance'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    agents: fromJS({
        all: [user],
    }),
    entities: entitiesInitialState,
} as unknown as RootState

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)

jest.mock('pages/common/forms/FileField', () => {
    type MockedProps = {
        required: boolean
    }

    const FileFieldMocked = ({ required }: MockedProps) => {
        return (
            <div>
                FileField component is required ? {required ? 'true' : 'false'}
            </div>
        )
    }

    return {
        __esModule: true,
        default: FileFieldMocked,
    }
})

type Props = ComponentProps<typeof GorgiasChatIntegrationAppearanceComponent>

jest.mock('../../../GorgiasChatIntegrationConnectedChannel', () => () => {
    return <div data-testid="GorgiasChatIntegrationConnectedChannel" />
})

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader',
    () => () => {
        return <div data-testid="GorgiasChatIntegrationHeader" />
    },
)

const mockClient = mockQueryClient()

describe('<GorgiasChatIntegrationAppearanceRevamp/>', () => {
    const realCSS = global.CSS

    const minProps = {
        gorgiasChatIntegrations: [] as any,
        storeIntegrations: [
            {
                id: 1,
                name: 'myStore1',
                type: SHOPIFY_INTEGRATION_TYPE,
                meta: {
                    shop_name: 'myStore1',
                },
            },
            {
                id: 2,
                name: 'myStore2',
                type: SHOPIFY_INTEGRATION_TYPE,
                meta: {
                    shop_name: 'myStore2',
                },
            },
        ] as any,
        actions: {
            updateOrCreateIntegration: jest.fn(() => Promise.resolve()),
            deleteIntegration: jest.fn(() => Promise.resolve()),
        },
        currentAccount: fromJS({
            meta: {
                company_name: 'Acme Corp',
            },
        }) as Map<any, any>,
    } as any as Props

    beforeEach(() => {
        jest.resetAllMocks()

        const fixedDate = new Date('2019-06-24')
        jest.spyOn(Date, 'now').mockImplementation(() => fixedDate.getTime())

        global.CSS = {
            ...global.CSS,
            supports: (): boolean => true,
            escape: realCSS?.escape,
        }

        mockUseFlag.mockImplementation((key, defaultValue) => {
            if (key === FeatureFlagKey.ChatEnableTranslationEdit) {
                return true
            }
            if (key === FeatureFlagKey.ChatControlBotLabelVisibility) {
                return true
            }
            if (key === FeatureFlagKey.ChatControlOutsideBusinessHoursColor) {
                return true
            }
            return defaultValue
        })
    })

    afterEach(() => {
        global.CSS = realCSS
    })

    describe('render()', () => {
        it('should render platform type selection when creating a new chat integration', () => {
            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(screen.getByText('Ecommerce platforms')).toBeInTheDocument()
            expect(screen.getByText('Any other website')).toBeInTheDocument()
        })

        it('should not show chat title field when ecommerce platform is selected', () => {
            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(
                screen.queryByRole('textbox', { name: /Chat title/i }),
            ).not.toBeInTheDocument()
        })

        it('should show chat title field when "any other website" is selected', async () => {
            const user = userEvent.setup()

            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            const anyOtherWebsiteOption = screen.getByText('Any other website')
            await act(() => user.click(anyOtherWebsiteOption))

            expect(
                screen.getByRole('textbox', { name: /Chat title/i }),
            ).toBeInTheDocument()
        })

        it('should render brand color field when updating', () => {
            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({
                                    id: 1,
                                    name: 'Acme Chat',
                                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                    decoration: {},
                                    meta: {
                                        language:
                                            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                                    },
                                })}
                                isUpdate={true}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(screen.getByText('Brand color')).toBeInTheDocument()
        })

        it('should not render conversation color field (deprecated in revamp)', () => {
            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(
                screen.queryByText('Conversation color'),
            ).not.toBeInTheDocument()
        })

        it('should render launcher position settings', () => {
            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(
                screen.getByText('Chat launcher position'),
            ).toBeInTheDocument()
            expect(screen.getByText('Position')).toBeInTheDocument()
            expect(screen.getByText('Move horizontally')).toBeInTheDocument()
            expect(screen.getByText('Move vertically')).toBeInTheDocument()
        })

        it('should preselect shopify integration if there is only one available', () => {
            const shopifyStoreName = 'MY ONLY SHOPIFY STORE'

            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                gorgiasChatIntegrations={[] as any}
                                storeIntegrations={
                                    [
                                        {
                                            id: 1,
                                            name: shopifyStoreName,
                                            type: SHOPIFY_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: shopifyStoreName,
                                            },
                                        },
                                    ] as any
                                }
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            const storeDropdownButton = screen.getByRole('button', {
                name: new RegExp(shopifyStoreName),
            })
            expect(storeDropdownButton).toBeInTheDocument()
        })

        it('should render agent avatar settings when updating', () => {
            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({
                                    id: 1,
                                    name: 'Acme Chat',
                                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                    decoration: {
                                        avatar: {
                                            image_type:
                                                GorgiasChatAvatarImageType.AGENT_PICTURE,
                                            name_type:
                                                GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                                        },
                                    },
                                    meta: {
                                        language:
                                            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                                    },
                                })}
                                isUpdate={true}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(
                screen.getByText('How your team appears to customers'),
            ).toBeInTheDocument()
            expect(screen.getByText('Name')).toBeInTheDocument()
            expect(
                screen.getAllByText('Profile picture').length,
            ).toBeGreaterThan(0)
        })

        it('should render logo inputs when updating', () => {
            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({
                                    id: 1,
                                    name: 'Acme Chat',
                                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                    decoration: {
                                        avatar: {
                                            image_type:
                                                GorgiasChatAvatarImageType.COMPANY_LOGO,
                                            name_type:
                                                GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                                            company_logo_url:
                                                'https://gorgias.io/avatar_picture.png',
                                        },
                                        header_picture_url:
                                            'https://gorgias.io/header_picture.png',
                                    },
                                    meta: {
                                        language:
                                            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                                    },
                                })}
                                isUpdate={true}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(screen.getByText('Home page logo')).toBeInTheDocument()
            expect(screen.getByText('Avatar logo')).toBeInTheDocument()
        })
    })

    describe('form submission', () => {
        it('should call createGorgiasChatIntegration with store when store is selected', () => {
            const mockCreateGorgiasChatIntegration = jest.fn<
                Promise<void>,
                [ReturnType<typeof fromJS>]
            >(() => Promise.resolve())

            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                actions={
                                    {
                                        createGorgiasChatIntegration:
                                            mockCreateGorgiasChatIntegration,
                                        deleteIntegration: jest.fn(() =>
                                            Promise.resolve(),
                                        ),
                                    } as unknown as typeof IntegrationsActions
                                }
                                gorgiasChatIntegrations={[] as any}
                                storeIntegrations={
                                    [
                                        {
                                            id: 1,
                                            name: 'myStore1',
                                            type: SHOPIFY_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: 'myStore1',
                                            },
                                        },
                                    ] as any
                                }
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            const addNewChatButton = screen.getByText(/Add new chat/)
            fireEvent.click(addNewChatButton)

            expect(mockCreateGorgiasChatIntegration).toHaveBeenCalled()
            const callArg = mockCreateGorgiasChatIntegration.mock.calls[0]![0]!
            expect(callArg.get('name')).toBe('myStore1 Support')
            expect(callArg.getIn(['meta', 'shop_name'])).toBe('myStore1')
            expect(callArg.getIn(['meta', 'shop_type'])).toBe('shopify')
            expect(callArg.getIn(['decoration', 'main_color'])).toBe('#115cb5')
            expect(callArg.getIn(['decoration', 'conversation_color'])).toBe(
                '#115cb5',
            )
        })

        it('should call createGorgiasChatIntegration with chat title when "any other website" is selected', () => {
            const mockCreateGorgiasChatIntegration = jest.fn<
                Promise<void>,
                [ReturnType<typeof fromJS>]
            >(() => Promise.resolve())

            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                actions={
                                    {
                                        createGorgiasChatIntegration:
                                            mockCreateGorgiasChatIntegration,
                                        deleteIntegration: jest.fn(() =>
                                            Promise.resolve(),
                                        ),
                                    } as unknown as typeof IntegrationsActions
                                }
                                gorgiasChatIntegrations={[]}
                                storeIntegrations={
                                    [
                                        {
                                            id: 1,
                                            name: 'myStore1',
                                            type: SHOPIFY_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: 'myStore1',
                                            },
                                        },
                                    ] as any
                                }
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            fireEvent.click(screen.getByText('Any other website'))

            const chatTitleInput = screen.getByRole('textbox', {
                name: /Chat title/i,
            })
            fireEvent.change(chatTitleInput, {
                target: { value: 'My Custom Chat' },
            })

            const addNewChatButton = screen.getByText(/Add new chat/)
            fireEvent.click(addNewChatButton)

            expect(mockCreateGorgiasChatIntegration).toHaveBeenCalled()
            const callArg = mockCreateGorgiasChatIntegration.mock.calls[0]![0]!
            expect(callArg.get('name')).toBe('My Custom Chat')
        })

        it('should call updateOrCreateIntegration when updating', () => {
            const mockUpdateOrCreateIntegration = jest.fn<
                Promise<void>,
                [ReturnType<typeof fromJS>]
            >(() => Promise.resolve())

            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                actions={
                                    {
                                        updateOrCreateIntegration:
                                            mockUpdateOrCreateIntegration,
                                        deleteIntegration: jest.fn(() =>
                                            Promise.resolve(),
                                        ),
                                    } as unknown as typeof IntegrationsActions
                                }
                                gorgiasChatIntegrations={
                                    [
                                        {
                                            id: 1,
                                            name: 'myChat1',
                                            type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: 'myStore1',
                                                shop_type:
                                                    SHOPIFY_INTEGRATION_TYPE,
                                            },
                                        },
                                    ] as any
                                }
                                storeIntegrations={
                                    [
                                        {
                                            id: 1,
                                            name: 'myStore1',
                                            type: SHOPIFY_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: 'myStore1',
                                            },
                                        },
                                    ] as any
                                }
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({
                                    id: 1,
                                    name: 'myChat1',
                                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                    meta: {
                                        shop_name: 'myStore1',
                                        shop_type: SHOPIFY_INTEGRATION_TYPE,
                                        shop_integration_id: 1,
                                    },
                                })}
                                isUpdate={true}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            const saveButton = screen.getByRole('button', { name: /Save/ })
            fireEvent.click(saveButton)

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalled()
            const callArg = mockUpdateOrCreateIntegration.mock.calls[0]![0]!
            expect(callArg.get('id')).toBe(1)
            expect(callArg.get('name')).toBe('myChat1')
        })

        it('should include company logo and header pictures in form submission when set', () => {
            const mockUpdateOrCreateIntegration = jest.fn<
                Promise<void>,
                [ReturnType<typeof fromJS>]
            >(() => Promise.resolve())

            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                actions={
                                    {
                                        updateOrCreateIntegration:
                                            mockUpdateOrCreateIntegration,
                                        deleteIntegration: jest.fn(() =>
                                            Promise.resolve(),
                                        ),
                                    } as unknown as typeof IntegrationsActions
                                }
                                gorgiasChatIntegrations={[]}
                                storeIntegrations={
                                    [
                                        {
                                            id: 1,
                                            name: 'myStore1',
                                            type: SHOPIFY_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: 'myStore1',
                                            },
                                        },
                                    ] as any
                                }
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({
                                    id: 1,
                                    name: 'myChat1',
                                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                    decoration: {
                                        avatar: {
                                            image_type: 'company-logo',
                                            name_type: 'agent-first-name',
                                            company_logo_url:
                                                'https://example.com/logo.png',
                                        },
                                        header_picture_url:
                                            'https://example.com/header.png',
                                        header_picture_url_offline:
                                            'https://example.com/header-offline.png',
                                    },
                                    meta: {
                                        shop_name: 'myStore1',
                                        shop_type: SHOPIFY_INTEGRATION_TYPE,
                                        shop_integration_id: 1,
                                    },
                                })}
                                isUpdate={true}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            const saveButton = screen.getByRole('button', { name: /Save/ })
            fireEvent.click(saveButton)

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalled()
            const callArg = mockUpdateOrCreateIntegration.mock.calls[0]![0]!
            expect(
                callArg.getIn(['decoration', 'avatar', 'company_logo_url']),
            ).toBe('https://example.com/logo.png')
            expect(callArg.getIn(['decoration', 'header_picture_url'])).toBe(
                'https://example.com/header.png',
            )
            expect(
                callArg.getIn(['decoration', 'header_picture_url_offline']),
            ).toBe('https://example.com/header-offline.png')
        })

        it('should disable submit button when no store is selected and ecommerce is chosen', () => {
            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                gorgiasChatIntegrations={[]}
                                storeIntegrations={
                                    [
                                        {
                                            id: 1,
                                            name: 'myStore1',
                                            type: SHOPIFY_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: 'myStore1',
                                            },
                                        },
                                        {
                                            id: 2,
                                            name: 'myStore2',
                                            type: SHOPIFY_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: 'myStore2',
                                            },
                                        },
                                    ] as any
                                }
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            const addNewChatButton = screen.getByRole('button', {
                name: /Add new chat/,
            })
            expect(addNewChatButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should disable submit button when "any other website" is selected and chat title is empty', async () => {
            const user = userEvent.setup()

            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                gorgiasChatIntegrations={[]}
                                storeIntegrations={
                                    [
                                        {
                                            id: 1,
                                            name: 'myStore1',
                                            type: SHOPIFY_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: 'myStore1',
                                            },
                                        },
                                        {
                                            id: 2,
                                            name: 'myStore2',
                                            type: SHOPIFY_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: 'myStore2',
                                            },
                                        },
                                    ] as any
                                }
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            const anyOtherWebsiteOption = screen.getByText('Any other website')
            await act(() => user.click(anyOtherWebsiteOption))

            const addNewChatButton = screen.getByRole('button', {
                name: /Add new chat/,
            })
            expect(addNewChatButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should disable button when submitting', () => {
            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                loading={fromJS({ updateIntegration: 1 })}
                                integration={fromJS({
                                    id: 1,
                                    name: 'myChat1',
                                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                    meta: {
                                        shop_name: 'myStore1',
                                        shop_type: SHOPIFY_INTEGRATION_TYPE,
                                        shop_integration_id: 1,
                                    },
                                })}
                                isUpdate={true}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            const saveButton = screen.getByRole('button', { name: /Save/ })
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('store picker', () => {
        it('should render store picker when creating new integration with multiple stores', () => {
            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                gorgiasChatIntegrations={[] as any}
                                storeIntegrations={
                                    [
                                        {
                                            id: 1,
                                            name: 'Store A',
                                            type: SHOPIFY_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: 'Store A',
                                            },
                                        },
                                        {
                                            id: 2,
                                            name: 'Store B',
                                            type: SHOPIFY_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: 'Store B',
                                            },
                                        },
                                    ] as any
                                }
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(
                screen.getByRole('listbox', { name: /Store selection/ }),
            ).toBeInTheDocument()
            expect(screen.getByText('Connect a store')).toBeInTheDocument()
        })
    })

    describe('color picker', () => {
        it('should use default color when invalid color is provided', () => {
            const mockUpdateOrCreateIntegration = jest.fn<
                Promise<void>,
                [ReturnType<typeof fromJS>]
            >(() => Promise.resolve())

            global.CSS = {
                ...global.CSS,
                supports: (): boolean => false,
                escape: global.CSS?.escape,
            }

            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                actions={
                                    {
                                        updateOrCreateIntegration:
                                            mockUpdateOrCreateIntegration,
                                        deleteIntegration: jest.fn(() =>
                                            Promise.resolve(),
                                        ),
                                    } as unknown as typeof IntegrationsActions
                                }
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({
                                    id: 1,
                                    name: 'myChat1',
                                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                    decoration: {
                                        main_color: 'invalid-color',
                                    },
                                    meta: {
                                        language:
                                            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                                    },
                                })}
                                isUpdate={true}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            const saveButton = screen.getByRole('button', { name: /Save/ })
            fireEvent.click(saveButton)

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalled()
            const callArg = mockUpdateOrCreateIntegration.mock.calls[0]![0]!
            expect(callArg.getIn(['decoration', 'main_color'])).toBe('#115cb5')
        })
    })

    describe('launcher type', () => {
        it('should include launcher with ICON type in form submission by default', () => {
            const mockCreateGorgiasChatIntegration = jest.fn<
                Promise<void>,
                [ReturnType<typeof fromJS>]
            >(() => Promise.resolve())

            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                actions={
                                    {
                                        createGorgiasChatIntegration:
                                            mockCreateGorgiasChatIntegration,
                                        deleteIntegration: jest.fn(() =>
                                            Promise.resolve(),
                                        ),
                                    } as unknown as typeof IntegrationsActions
                                }
                                gorgiasChatIntegrations={[] as any}
                                storeIntegrations={
                                    [
                                        {
                                            id: 1,
                                            name: 'myStore1',
                                            type: SHOPIFY_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: 'myStore1',
                                            },
                                        },
                                    ] as any
                                }
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            const addNewChatButton = screen.getByText(/Add new chat/)
            fireEvent.click(addNewChatButton)

            expect(mockCreateGorgiasChatIntegration).toHaveBeenCalled()
            const callArg = mockCreateGorgiasChatIntegration.mock.calls[0]![0]!
            expect(callArg.getIn(['decoration', 'launcher', 'type'])).toBe(
                'icon',
            )
        })
    })

    describe('platform type selection', () => {
        it('should switch to ecommerce platform when clicking the radio button', async () => {
            const user = userEvent.setup()

            render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                gorgiasChatIntegrations={[] as any}
                                storeIntegrations={
                                    [
                                        {
                                            id: 1,
                                            name: 'myStore1',
                                            type: SHOPIFY_INTEGRATION_TYPE,
                                            meta: {
                                                shop_name: 'myStore1',
                                            },
                                        },
                                    ] as any
                                }
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            const anyOtherWebsiteOption = screen.getByText('Any other website')
            await act(() => user.click(anyOtherWebsiteOption))

            expect(
                screen.getByRole('textbox', { name: /Chat title/i }),
            ).toBeInTheDocument()

            const ecommercePlatformsOption = screen.getByText(
                'Ecommerce platforms',
            )
            await act(() => user.click(ecommercePlatformsOption))

            expect(
                screen.queryByRole('textbox', { name: /Chat title/i }),
            ).not.toBeInTheDocument()
        })
    })
})
