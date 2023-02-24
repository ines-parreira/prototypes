import React, {ComponentProps} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'

import {user} from 'fixtures/users'
import {RootState, StoreDispatch} from 'state/types'
import * as IntegrationsActions from 'state/integrations/actions'
import {
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_MEMBERS,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
} from 'config/integrations/gorgias_chat'
import {
    SHOPIFY_INTEGRATION_TYPE,
    GORGIAS_CHAT_INTEGRATION_TYPE,
} from 'constants/integration'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'

import {GorgiasChatIntegrationAppearanceComponent} from '../GorgiasChatIntegrationAppearance'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    agents: fromJS({
        all: [user],
    }),
} as unknown as RootState

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)

jest.mock('pages/common/forms/FileField', () => {
    type MockedProps = {
        required: boolean
    }

    const FileFieldMocked = ({required}: MockedProps) => {
        return (
            <div>
                FileField component is required ? {required ? 'true' : 'false'}
            </div>
        )
    }

    const {UploadType} = jest.requireActual('pages/common/forms/FileField')

    return {
        __esModule: true,
        UploadType,
        default: FileFieldMocked,
    }
})

type Props = ComponentProps<typeof GorgiasChatIntegrationAppearanceComponent>

jest.mock('../../GorgiasChatIntegrationNavigation', () => () => {
    return <div data-testid="GorgiasChatIntegrationNavigation" />
})

describe('<GorgiasChatIntegrationAppearance/>', () => {
    const realCSS = global.CSS

    const minProps = {
        gorgiasChatIntegrations: fromJS([]),
        shopifyIntegrations: fromJS([
            {
                id: 1,
                name: 'mylittleintegration',
                type: SHOPIFY_INTEGRATION_TYPE,
                meta: {
                    shop_name: 'myStore1',
                },
            },
            {
                id: 2,
                name: 'mylittleintegration2',
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
            supports: (): boolean => true,
            escape: realCSS?.escape,
        }

        mockFlags({
            [FeatureFlagKey.ChatEnableTranslationEdit]: true,
        })
    })

    afterEach(() => {
        global.CSS = realCSS
    })

    describe('render()', () => {
        it('should display correctly when creating a new chat integration', () => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <GorgiasChatIntegrationAppearanceComponent
                        {...minProps}
                        loading={fromJS({updateIntegration: false})}
                        integration={fromJS({})}
                        currentUser={fromJS({})}
                        isUpdate={false}
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should display correctly when updating an existing integration', () => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <GorgiasChatIntegrationAppearanceComponent
                        {...minProps}
                        loading={fromJS({updateIntegration: false})}
                        integration={fromJS({
                            id: 2,
                            name: 'hellochatintegration',
                            type: GORGIAS_CHAT_INTEGRATION_TYPE,
                            meta: {
                                language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                            },
                        })}
                        currentUser={fromJS({})}
                        isUpdate={true}
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should display correctly when integration is loading', () => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <GorgiasChatIntegrationAppearanceComponent
                        {...minProps}
                        loading={fromJS({updateIntegration: 2})}
                        integration={fromJS({
                            id: 2,
                            name: 'hellochatintegration',
                            type: GORGIAS_CHAT_INTEGRATION_TYPE,
                            meta: {
                                language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                            },
                        })}
                        currentUser={fromJS({})}
                        isUpdate={true}
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it(
            'should mark the file field for team picture as required because the avatar type is `team-picture` and ' +
                'there is no team picture set',
            () => {
                const {container} = render(
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationAppearanceComponent
                            {...minProps}
                            loading={fromJS({updateIntegration: false})}
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
                            currentUser={fromJS({})}
                            isUpdate={true}
                        />
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            }
        )

        it(
            'should not mark the file field for team picture as required because the avatar type is `team-picture` but ' +
                'there is a team picture set',
            () => {
                const {container} = render(
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationAppearanceComponent
                            {...minProps}
                            loading={fromJS({updateIntegration: false})}
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
                            currentUser={fromJS({})}
                            isUpdate={true}
                        />
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            }
        )

        it(
            'should not mark the file field for team picture as required because the avatar type is ' +
                '`team-members`',
            () => {
                const {container} = render(
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationAppearanceComponent
                            {...minProps}
                            loading={fromJS({updateIntegration: false})}
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
                            currentUser={fromJS({})}
                            isUpdate={true}
                        />
                    </Provider>
                )

                expect(container).toMatchSnapshot()
            }
        )

        it('should submit and call the createGorgiasChatIntegration with 2nd store name option selected - myStore2 ', () => {
            const mockCreateGorgiasChatIntegration = jest.fn(() =>
                Promise.resolve()
            )

            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <GorgiasChatIntegrationAppearanceComponent
                        {...minProps}
                        actions={
                            {
                                createGorgiasChatIntegration:
                                    mockCreateGorgiasChatIntegration,
                                deleteIntegration: jest.fn(() =>
                                    Promise.resolve()
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
                        shopifyIntegrations={fromJS([
                            {
                                id: 1,
                                name: 'mylittleintegration',
                                type: SHOPIFY_INTEGRATION_TYPE,
                                meta: {
                                    shop_name: 'myStore1',
                                },
                            },
                            {
                                id: 2,
                                name: 'mylittleintegration2',
                                type: SHOPIFY_INTEGRATION_TYPE,
                                meta: {
                                    shop_name: 'myStore2',
                                },
                            },
                            {
                                id: 3,
                                deactivated_datetime: '2021-01-26T00:29:00Z',
                                name: 'mylittleintegration3',
                                type: SHOPIFY_INTEGRATION_TYPE,
                                meta: {
                                    shop_name: 'myStore3',
                                },
                            },
                        ])}
                        loading={fromJS({updateIntegration: false})}
                        integration={fromJS({
                            id: 2,
                            name: 'hellochatintegration',
                            type: GORGIAS_CHAT_INTEGRATION_TYPE,
                            meta: {
                                language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                            },
                        })}
                        currentUser={fromJS({})}
                        isUpdate={false}
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()

            const optionMyStore2 = screen.getByText(/myStore2/)
            const chatTitleInput = screen.getByLabelText('Chat title')
            const addNewChatButton = screen.getByText(/Add new chat/)

            fireEvent.click(optionMyStore2)
            fireEvent.change(chatTitleInput, {target: {value: 'myTestChat'}})
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
                      "conversation_color": "#0d87dd",
                      "position": Immutable.Map {
                        "alignment": "bottom-right",
                        "offsetX": 0,
                        "offsetY": 0,
                      },
                      "avatar_team_picture_url": undefined,
                      "introduction_text": "How can we help?",
                      "offline_introduction_text": "We'll be back tomorrow",
                      "avatar": Immutable.Map {
                        "image_type": "agent-picture",
                        "name_type": "agent-first-name",
                      },
                      "main_color": "#0d87dd",
                    },
                    "meta": Immutable.Map {
                      "language": "en-US",
                      "shop_name": "myStore2",
                      "shop_type": "shopify",
                      "shop_integration_id": 2,
                      "preferences": Immutable.Map {
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
                Promise.resolve()
            )

            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <GorgiasChatIntegrationAppearanceComponent
                        {...minProps}
                        actions={
                            {
                                updateOrCreateIntegration:
                                    mockUpdateOrCreateIntegration,
                                deleteIntegration: jest.fn(() =>
                                    Promise.resolve()
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
                        shopifyIntegrations={fromJS([
                            {
                                id: 1,
                                name: 'mylittleintegration',
                                type: SHOPIFY_INTEGRATION_TYPE,
                                meta: {
                                    shop_name: 'myStore1',
                                },
                            },
                            {
                                id: 2,
                                name: 'mylittleintegration2',
                                type: SHOPIFY_INTEGRATION_TYPE,
                                meta: {
                                    shop_name: 'myStore2',
                                },
                            },
                            {
                                id: 3,
                                deactivated_datetime: '2021-01-26T00:29:00Z',
                                name: 'mylittleintegration3',
                                type: SHOPIFY_INTEGRATION_TYPE,
                                meta: {
                                    shop_name: 'myStore3',
                                },
                            },
                        ])}
                        loading={fromJS({updateIntegration: false})}
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
                        currentUser={fromJS({})}
                        isUpdate={true}
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()

            const chatTitleInput = screen.getByLabelText('Chat title')
            const saveChangesButton = screen.getByText(/Save changes/)

            fireEvent.change(chatTitleInput, {target: {value: 'myTestChat'}})
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
                      "conversation_color": "#0d87dd",
                      "position": Immutable.Map {
                        "alignment": "bottom-right",
                        "offsetX": 0,
                        "offsetY": 0,
                      },
                      "avatar_team_picture_url": undefined,
                      "introduction_text": "How can we help?",
                      "offline_introduction_text": "We'll be back tomorrow",
                      "avatar": Immutable.Map {
                        "image_type": "agent-picture",
                        "name_type": "agent-first-name",
                      },
                      "main_color": "#0d87dd",
                    },
                    "meta": Immutable.Map {
                      "shop_name": "myStore1",
                      "shop_type": "shopify",
                      "shop_integration_id": 2,
                      "language": "en-US",
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
                Promise.resolve()
            )
            const shopifyStoreName = 'MY ONLY SHOPIFY STORE'

            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <GorgiasChatIntegrationAppearanceComponent
                        {...minProps}
                        actions={
                            {
                                updateOrCreateIntegration:
                                    mockUpdateOrCreateIntegration,
                                deleteIntegration: jest.fn(() =>
                                    Promise.resolve()
                                ),
                            } as unknown as typeof IntegrationsActions
                        }
                        gorgiasChatIntegrations={fromJS([])}
                        shopifyIntegrations={fromJS([
                            {
                                id: 1,
                                name: 'mylittleintegration',
                                type: SHOPIFY_INTEGRATION_TYPE,
                                meta: {
                                    shop_name: shopifyStoreName,
                                },
                            },
                        ])}
                        loading={fromJS({updateIntegration: false})}
                        integration={fromJS({})}
                        currentUser={fromJS({})}
                        isUpdate={false}
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render inputs for agent avatar name and image settings', () => {
            mockFlags({
                [FeatureFlagKey.ChatAgentAvatarCustomization]: true,
            })

            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <GorgiasChatIntegrationAppearanceComponent
                        {...minProps}
                        loading={fromJS({updateIntegration: false})}
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
                                language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                            },
                        })}
                        currentUser={fromJS({
                            name: 'John Doe',
                        })}
                        isUpdate={true}
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })
})
