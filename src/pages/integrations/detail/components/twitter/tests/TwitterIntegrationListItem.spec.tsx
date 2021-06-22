import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import TwitterIntegrationListItem from '../TwitterIntegrationListItem'
import {IntegrationType} from '../../../../../../models/integration/types'

describe('<TwitterIntegrationListItem/>', () => {
    let integration: Map<string, any>
    let activateIntegration: jest.MockedFunction<any>
    let deactivateIntegration: jest.MockedFunction<any>

    beforeEach(() => {
        integration = fromJS({
            id: 1,
            name: 'Fake twitter integration',
            description: '@faketwitterintegration',
            type: IntegrationType.TwitterIntegrationType,
            meta: {
                about: 'Foo bar',
                picture: 'https://some-random-url.com/picture.jpeg',
                settings: {
                    mentions_enabled: true,
                    tweets_replies_enabled: true,
                    direct_messages_enabled: true,
                },
            },
        })
        activateIntegration = jest.fn()
        deactivateIntegration = jest.fn()
    })

    describe('render()', () => {
        it('should render checked', () => {
            const {container} = render(
                <TwitterIntegrationListItem
                    integration={integration}
                    actions={{activateIntegration, deactivateIntegration}}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render unchecked', () => {
            integration = integration.set('deactivated_datetime', '2021-05-15')

            const {container} = render(
                <TwitterIntegrationListItem
                    integration={integration}
                    actions={{activateIntegration, deactivateIntegration}}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
