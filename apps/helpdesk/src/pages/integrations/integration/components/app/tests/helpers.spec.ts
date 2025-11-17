import type { Integration } from 'models/integration/types'

import * as helpers from '../helpers'

describe('Integrations helper', () => {
    it('getReconnectUrl', () => {
        const connectUrl = 'https://connect.com'
        const domain = 'acme'
        const integration = { id: 1234 } as Integration
        expect(helpers.getReconnectUrl(connectUrl, domain, integration)).toBe(
            'https://connect.com/?account=acme&integration_id=1234',
        )
    })
})
