import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import TwitterIntegrationListItem from '../TwitterIntegrationListItem'
import {IntegrationType} from '../../../../../../models/integration/types'

describe('<TwitterIntegrationListItem/>', () => {
    let integration: Map<string, any>

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
    })

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <TwitterIntegrationListItem integration={integration} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
