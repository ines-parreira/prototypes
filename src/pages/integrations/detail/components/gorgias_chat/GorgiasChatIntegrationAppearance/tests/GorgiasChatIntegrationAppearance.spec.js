import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import configureStore from '../../../../../../../store/configureStore'
import {
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_MEMBERS,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
} from '../../../../../../../config/integrations/gorgias_chat'
import {
    SHOPIFY_INTEGRATION_TYPE,
    GORGIAS_CHAT_INTEGRATION_TYPE,
} from '../../../../../../../constants/integration'

import {GorgiasChatIntegrationAppearanceComponent} from '../GorgiasChatIntegrationAppearance'

describe('<GorgiasChatIntegrationAppearance/>', () => {
    const minStore = {
        integrations: fromJS({
            integrations: [
                {
                    id: 1,
                    name: 'mylittleintegration',
                    type: SHOPIFY_INTEGRATION_TYPE,
                },
            ],
        }),
    }

    const minProps = {
        store: configureStore(minStore),
        actions: {},
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('render()', () => {
        it('should display correctly when creating a new chat integration', () => {
            const component = shallow(
                <GorgiasChatIntegrationAppearanceComponent
                    {...minProps}
                    loading={fromJS({updateIntegration: false})}
                    integration={fromJS({})}
                    currentUser={fromJS({})}
                    isUpdate={false}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display correctly when updating an existing integration', () => {
            const component = shallow(
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
            )

            expect(component).toMatchSnapshot()
        })

        it('should display correctly when integration is loading', () => {
            const component = shallow(
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
            )

            expect(component).toMatchSnapshot()
        })

        it(
            'should mark the file field for team picture as required because the avatar type is `team-picture` and ' +
                'there is no team picture set',
            () => {
                const component = shallow(
                    <GorgiasChatIntegrationAppearanceComponent
                        {...minProps}
                        loading={fromJS({updateIntegration: false})}
                        integration={fromJS({
                            id: 2,
                            name: 'hellochatintegration',
                            type: GORGIAS_CHAT_INTEGRATION_TYPE,
                            decoration: {
                                avatar_type: GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
                                avatar_team_picture_url: null,
                            },
                            meta: {
                                language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                            },
                        })}
                        currentUser={fromJS({})}
                        isUpdate={true}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it(
            'should not mark the file field for team picture as required because the avatar type is `team-picture` but ' +
                'there is a team picture set',
            () => {
                const component = shallow(
                    <GorgiasChatIntegrationAppearanceComponent
                        {...minProps}
                        loading={fromJS({updateIntegration: false})}
                        integration={fromJS({
                            id: 2,
                            name: 'hellochatintegration',
                            type: GORGIAS_CHAT_INTEGRATION_TYPE,
                            decoration: {
                                avatar_type: GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
                                avatar_team_picture_url:
                                    'https://gorgias.io/teampicture.png',
                            },
                            meta: {
                                language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                            },
                        })}
                        currentUser={fromJS({})}
                        isUpdate={true}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it(
            'should not mark the file field for team picture as required because the avatar type is ' +
                '`team-members`',
            () => {
                const component = shallow(
                    <GorgiasChatIntegrationAppearanceComponent
                        {...minProps}
                        loading={fromJS({updateIntegration: false})}
                        integration={fromJS({
                            id: 2,
                            name: 'hellochatintegration',
                            type: GORGIAS_CHAT_INTEGRATION_TYPE,
                            decoration: {
                                avatar_type: GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_MEMBERS,
                                avatar_team_picture_url: null,
                            },
                            meta: {
                                language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                            },
                        })}
                        currentUser={fromJS({})}
                        isUpdate={true}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )
    })
})
