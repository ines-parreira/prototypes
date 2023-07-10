import {fromJS, Map} from 'immutable'

import {eventMatcher} from '../matcher'
import shopifyEvent from '../shopify'
import rechargeEvent from '../recharge'

jest.mock('../shopify')
jest.mock('../recharge')
const mockShopifyEvent = shopifyEvent as jest.Mock
const mockRechargeEvent = rechargeEvent as jest.Mock

describe('eventMatcher', () => {
    const actionConfig = {
        name: 'name',
        label: 'label',
        objectType: 'objectType',
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('Should return undefined if type does not match', () => {
        const event = eventMatcher({
            integration: Map(),
            actionConfig,
            payload: Map(),
            data: Map(),
        })
        expect(event).toBeUndefined()
    })

    it('Should call shopifyEvent if type is shopify', () => {
        mockShopifyEvent.mockReturnValue({
            objectLabel: 'shopify',
            objectLink: 'shopify',
        })
        const event = eventMatcher({
            integration: fromJS({type: 'shopify'}),
            actionConfig,
            payload: Map(),
            data: Map(),
        })
        expect(event).toStrictEqual({
            objectLabel: 'shopify',
            objectLink: 'shopify',
        })
    })

    it('Should call rechargeEvent if type is recharge', () => {
        mockRechargeEvent.mockReturnValue({
            objectLabel: 'recharge',
            objectLink: 'recharge',
        })
        const event = eventMatcher({
            integration: fromJS({type: 'recharge'}),
            actionConfig,
            payload: Map(),
            data: Map(),
        })
        expect(event).toStrictEqual({
            objectLabel: 'recharge',
            objectLink: 'recharge',
        })
    })
})
