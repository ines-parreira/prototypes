import type { ComponentProps } from 'react'
import React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import {
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_MEMBERS,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
} from 'config/integrations/gorgias_chat'
import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import { entitiesInitialState } from 'fixtures/entities'
import { user } from 'fixtures/users'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import type * as IntegrationsActions from 'state/integrations/actions'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { GorgiasChatIntegrationAppearanceComponent } from '../GorgiasChatIntegrationAppearance'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const mockCurrentUser = fromJS({
    name: 'John Doe',
})

const defaultState = {
    agents: fromJS({
        all: [user],
    }),
    entities: entitiesInitialState,
} as unknown as RootState

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)

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

jest.mock('../../GorgiasChatIntegrationConnectedChannel', () => () => {
    return <div data-testid="GorgiasChatIntegrationConnectedChannel" />
})

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader',
    () => () => {
        return <div data-testid="GorgiasChatIntegrationHeader" />
    },
)

const mockClient = mockQueryClient()

describe('<GorgiasChatIntegrationAppearance/>', () => {
    const realCSS = global.CSS

    const minProps = {
        gorgiasChatIntegrations: fromJS([]),
        storeIntegrations: fromJS([
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
        ]),
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

        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

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
        it('should display correctly when creating a new chat integration', () => {
            const { container } = render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                currentUser={mockCurrentUser}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(container).toMatchSnapshot()
        })

        it('should display correctly when updating an existing integration', () => {
            const { container } = render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({
                                    id: 2,
                                    name: 'hellochatintegration',
                                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                    meta: {
                                        language:
                                            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                                    },
                                })}
                                currentUser={mockCurrentUser}
                                isUpdate={true}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(container).toMatchSnapshot()
        })

        it('should display correctly when integration is loading', () => {
            const { container } = render(
                <Router history={history}>
                    <QueryClientProvider client={mockClient}>
                        <Provider store={mockStore(defaultState)}>
                            <GorgiasChatIntegrationAppearanceComponent
                                {...minProps}
                                loading={fromJS({ updateIntegration: 2 })}
                                integration={fromJS({
                                    id: 2,
                                    name: 'hellochatintegration',
                                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                    meta: {
                                        language:
                                            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                                    },
                                })}
                                currentUser={mockCurrentUser}
                                isUpdate={true}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(container).toMatchSnapshot()
        })

        it(
            'should mark the file field for team picture as required because the avatar type is `team-picture` and ' +
                'there is no team picture set',
            () => {
                const { container } = render(
                    <Router history={history}>
                        <QueryClientProvider client={mockClient}>
                            <Provider store={mockStore(defaultState)}>
                                <GorgiasChatIntegrationAppearanceComponent
                                    {...minProps}
                                    loading={fromJS({
                                        updateIntegration: false,
                                    })}
                                    integration={fromJS({
                                        id: 2,
                                        name: 'hellochatintegration',
                                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                        decoration: {
                                            avatar_type:
                                                GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
                                            avatar_team_picture_url: null,
                                        },
                                        meta: {
                                            language:
                                                GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                                        },
                                    })}
                                    currentUser={mockCurrentUser}
                                    isUpdate={true}
                                />
                            </Provider>
                        </QueryClientProvider>
                    </Router>,
                )

                expect(container).toMatchSnapshot()
            },
        )

        it(
            'should not mark the file field for team picture as required because the avatar type is `team-picture` but ' +
                'there is a team picture set',
            () => {
                const { container } = render(
                    <Router history={history}>
                        <QueryClientProvider client={mockClient}>
                            <Provider store={mockStore(defaultState)}>
                                <GorgiasChatIntegrationAppearanceComponent
                                    {...minProps}
                                    loading={fromJS({
                                        updateIntegration: false,
                                    })}
                                    integration={fromJS({
                                        id: 2,
                                        name: 'hellochatintegration',
                                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                        decoration: {
                                            avatar_type:
                                                GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
                                            avatar_team_picture_url:
                                                'https://gorgias.io/teampicture.png',
                                        },
                                        meta: {
                                            language:
                                                GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                                        },
                                    })}
                                    currentUser={mockCurrentUser}
                                    isUpdate={true}
                                />
                            </Provider>
                        </QueryClientProvider>
                    </Router>,
                )

                expect(container).toMatchSnapshot()
            },
        )

        it(
            'should not mark the file field for team picture as required because the avatar type is ' +
                '`team-members`',
            () => {
                const { container } = render(
                    <Router history={history}>
                        <QueryClientProvider client={mockClient}>
                            <Provider store={mockStore(defaultState)}>
                                <GorgiasChatIntegrationAppearanceComponent
                                    {...minProps}
                                    loading={fromJS({
                                        updateIntegration: false,
                                    })}
                                    integration={fromJS({
                                        id: 2,
                                        name: 'hellochatintegration',
                                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                        decoration: {
                                            avatar_type:
                                                GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_MEMBERS,
                                            avatar_team_picture_url: null,
                                        },
                                        meta: {
                                            language:
                                                GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                                        },
                                    })}
                                    currentUser={mockCurrentUser}
                                    isUpdate={true}
                                />
                            </Provider>
                        </QueryClientProvider>
                    </Router>,
                )

                expect(container).toMatchSnapshot()
            },
        )

        it('should submit and call the createGorgiasChatIntegration with 2nd store name option selected - myStore2 ', () => {
            const mockCreateGorgiasChatIntegration = jest.fn(() =>
                Promise.resolve(),
            )

            const { container } = render(
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
                                gorgiasChatIntegrations={fromJS([
                                    {
                                        id: 1,
                                        name: 'myChat1',
                                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                        meta: {
                                            shop_name: 'myStore1',
                                            shop_type: SHOPIFY_INTEGRATION_TYPE,
                                        },
                                    },
                                    {
                                        id: 2,
                                        name: 'myChat2',
                                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                        meta: {
                                            shop_name: 'myStore2',
                                            shop_type: SHOPIFY_INTEGRATION_TYPE,
                                        },
                                    },
                                    {
                                        id: 3,
                                        name: 'myChat3',
                                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                        meta: {
                                            shop_name: 'myStore2',
                                            shop_type: SHOPIFY_INTEGRATION_TYPE,
                                        },
                                    },
                                ])}
                                storeIntegrations={fromJS([
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
                                    {
                                        id: 3,
                                        deactivated_datetime:
                                            '2021-01-26T00:29:00Z',
                                        name: 'myStore3',
                                        type: SHOPIFY_INTEGRATION_TYPE,
                                        meta: {
                                            shop_name: 'myStore3',
                                        },
                                    },
                                ])}
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({
                                    id: 2,
                                    name: 'hellochatintegration',
                                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                    meta: {
                                        language:
                                            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                                    },
                                })}
                                currentUser={mockCurrentUser}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(container).toMatchSnapshot()

            const optionMyStore2 = screen.getByText(/myStore2/)
            const chatTitleInput = screen.getByLabelText('Chat title')
            const addNewChatButton = screen.getByText(/Add new chat/)

            fireEvent.click(optionMyStore2)
            fireEvent.change(chatTitleInput, {
                target: { value: 'myTestChat' },
            })
            fireEvent.click(addNewChatButton)

            expect(mockCreateGorgiasChatIntegration.mock.calls[0])
                .toMatchInlineSnapshot(`
                [
                  Immutable.Map {
                    "type": "gorgias_chat",
                    "name": "myTestChat",
                    "decoration": Immutable.Map {
                      "avatar_type": "team-members",
                      "launcher": Immutable.Map {
                        "type": "icon",
                      },
                      "background_color_style": "gradient",
                      "conversation_color": "#115cb5",
                      "position": Immutable.Map {
                        "alignment": "bottom-right",
                        "offsetX": 0,
                        "offsetY": 0,
                      },
                      "main_font_family": "Inter",
                      "avatar_team_picture_url": undefined,
                      "introduction_text": "How can we help?",
                      "use_main_color_outside_business_hours": false,
                      "offline_introduction_text": "We will be back soon",
                      "avatar": Immutable.Map {
                        "image_type": "agent-picture",
                        "name_type": "agent-first-name",
                      },
                      "main_color": "#115cb5",
                      "display_bot_label": true,
                    },
                    "meta": Immutable.Map {
                      "language": "en-US",
                      "languages": Immutable.List [
                        Immutable.Map {
                          "language": "en-US",
                          "primary": true,
                        },
                      ],
                      "shop_name": "myStore2",
                      "shop_type": "shopify",
                      "shop_integration_id": 2,
                      "preferences": Immutable.Map {
                        "email_capture_enabled": true,
                        "email_capture_enforcement": "optional",
                        "auto_responder": Immutable.Map {
                          "enabled": true,
                          "reply": "reply-dynamic",
                        },
                        "offline_mode_enabled_datetime": null,
                      },
                    },
                  },
                ]
            `)
        })

        it('should submit and call the updateOrCreateIntegration', () => {
            const mockUpdateOrCreateIntegration = jest.fn(() =>
                Promise.resolve(),
            )

            const { container } = render(
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
                                gorgiasChatIntegrations={fromJS([
                                    {
                                        id: 1,
                                        name: 'myChat1',
                                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                        meta: {
                                            shop_name: 'myStore1',
                                            shop_type: SHOPIFY_INTEGRATION_TYPE,
                                        },
                                    },
                                    {
                                        id: 2,
                                        name: 'myChat2',
                                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                        meta: {
                                            shop_name: 'myStore2',
                                            shop_type: SHOPIFY_INTEGRATION_TYPE,
                                        },
                                    },
                                    {
                                        id: 3,
                                        name: 'myChat3',
                                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                        meta: {
                                            shop_name: 'myStore2',
                                            shop_type: SHOPIFY_INTEGRATION_TYPE,
                                        },
                                    },
                                ])}
                                storeIntegrations={fromJS([
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
                                    {
                                        id: 3,
                                        deactivated_datetime:
                                            '2021-01-26T00:29:00Z',
                                        name: 'myStore3',
                                        type: SHOPIFY_INTEGRATION_TYPE,
                                        meta: {
                                            shop_name: 'myStore3',
                                        },
                                    },
                                ])}
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({
                                    id: 1,
                                    name: 'myChat1',
                                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                                    meta: {
                                        shop_name: 'myStore1',
                                        shop_type: SHOPIFY_INTEGRATION_TYPE,
                                        shop_integration_id: 2,
                                    },
                                })}
                                currentUser={mockCurrentUser}
                                isUpdate={true}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(container).toMatchSnapshot()

            const chatTitleInput = screen.getByLabelText('Chat title')
            const saveChangesButton = screen.getByText(/Save changes/)

            fireEvent.change(chatTitleInput, {
                target: { value: 'myTestChat' },
            })
            fireEvent.click(saveChangesButton)

            expect(mockUpdateOrCreateIntegration.mock.calls[0])
                .toMatchInlineSnapshot(`
                [
                  Immutable.Map {
                    "type": "gorgias_chat",
                    "name": "myTestChat",
                    "decoration": Immutable.Map {
                      "avatar_type": "team-members",
                      "launcher": Immutable.Map {
                        "type": "icon",
                      },
                      "background_color_style": "gradient",
                      "conversation_color": "#115cb5",
                      "position": Immutable.Map {
                        "alignment": "bottom-right",
                        "offsetX": 0,
                        "offsetY": 0,
                      },
                      "main_font_family": "Inter",
                      "avatar_team_picture_url": undefined,
                      "introduction_text": "How can we help?",
                      "use_main_color_outside_business_hours": false,
                      "offline_introduction_text": "We will be back soon",
                      "avatar": Immutable.Map {
                        "image_type": "agent-picture",
                        "name_type": "agent-first-name",
                      },
                      "main_color": "#115cb5",
                      "display_bot_label": true,
                    },
                    "meta": Immutable.Map {
                      "shop_name": "myStore1",
                      "shop_type": "shopify",
                      "shop_integration_id": 2,
                      "language": "en-US",
                      "languages": Immutable.List [
                        Immutable.Map {
                          "language": "en-US",
                          "primary": true,
                        },
                      ],
                      "position": Immutable.Map {
                        "alignment": "bottom-right",
                        "offsetX": 0,
                        "offsetY": 0,
                      },
                    },
                    "id": 1,
                  },
                ]
            `)
        })

        it("should preselect shopify integration if there's only one available", () => {
            const mockUpdateOrCreateIntegration = jest.fn(() =>
                Promise.resolve(),
            )
            const shopifyStoreName = 'MY ONLY SHOPIFY STORE'

            const { container } = render(
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
                                gorgiasChatIntegrations={fromJS([])}
                                storeIntegrations={fromJS([
                                    {
                                        id: 1,
                                        name: shopifyStoreName,
                                        type: SHOPIFY_INTEGRATION_TYPE,
                                        meta: {
                                            shop_name: shopifyStoreName,
                                        },
                                    },
                                ])}
                                loading={fromJS({ updateIntegration: false })}
                                integration={fromJS({})}
                                currentUser={mockCurrentUser}
                                isUpdate={false}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(container).toMatchSnapshot()
        })

        it('should render inputs for agent avatar name and image settings', () => {
            const { container } = render(
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
                                currentUser={mockCurrentUser}
                                isUpdate={true}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(container).toMatchSnapshot()
        })

        it('should render inputs for header logo and avatar logo', () => {
            mockUseFlag.mockImplementation((key, defaultValue) => {
                if (key === FeatureFlagKey.ChatHeaderPictureStyle) {
                    return true
                }
                return defaultValue
            })

            const { container } = render(
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
                                currentUser={mockCurrentUser}
                                isUpdate={true}
                            />
                        </Provider>
                    </QueryClientProvider>
                </Router>,
            )

            expect(container).toMatchSnapshot()
        })
    })
})
