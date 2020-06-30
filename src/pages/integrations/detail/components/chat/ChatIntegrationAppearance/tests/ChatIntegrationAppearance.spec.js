import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import configureStore from '../../../../../../../store/configureStore'
import {
    SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_MEMBERS,
    SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
    SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
} from '../../../../../../../config/integrations/smooch_inside'
import {
    SHOPIFY_INTEGRATION_TYPE,
    SMOOCH_INSIDE_INTEGRATION_TYPE,
} from '../../../../../../../constants/integration'

import {ChatIntegrationAppearance} from '../ChatIntegrationAppearance'

describe('<ChatIntegrationAppearance/>', () => {
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
                <ChatIntegrationAppearance
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
                <ChatIntegrationAppearance
                    {...minProps}
                    loading={fromJS({updateIntegration: false})}
                    integration={fromJS({
                        id: 2,
                        name: 'hellosmoochintegration',
                        type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                        meta: {
                            language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
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
                <ChatIntegrationAppearance
                    {...minProps}
                    loading={fromJS({updateIntegration: 2})}
                    integration={fromJS({
                        id: 2,
                        name: 'hellosmoochintegration',
                        type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                        meta: {
                            language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
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
                    <ChatIntegrationAppearance
                        {...minProps}
                        loading={fromJS({updateIntegration: false})}
                        integration={fromJS({
                            id: 2,
                            name: 'hellosmoochintegration',
                            type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                            decoration: {
                                avatar_type: SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
                                avatar_team_picture_url: null,
                            },
                            meta: {
                                language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
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
                    <ChatIntegrationAppearance
                        {...minProps}
                        loading={fromJS({updateIntegration: false})}
                        integration={fromJS({
                            id: 2,
                            name: 'hellosmoochintegration',
                            type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                            decoration: {
                                avatar_type: SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
                                avatar_team_picture_url:
                                    'https://gorgias.io/teampicture.png',
                            },
                            meta: {
                                language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
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
                    <ChatIntegrationAppearance
                        {...minProps}
                        loading={fromJS({updateIntegration: false})}
                        integration={fromJS({
                            id: 2,
                            name: 'hellosmoochintegration',
                            type: SMOOCH_INSIDE_INTEGRATION_TYPE,
                            decoration: {
                                avatar_type: SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_MEMBERS,
                                avatar_team_picture_url: null,
                            },
                            meta: {
                                language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
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
