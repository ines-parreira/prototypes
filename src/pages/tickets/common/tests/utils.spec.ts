import {MacroAction} from '@gorgias/api-queries'

import {TicketMessageSourceType} from 'business/types/ticket'
import {ActionTemplate} from 'config'
import {MacroActionName} from 'models/macroAction/types'
import {
    getPersonLabelFromSource,
    getSortedIntegrationActions,
    getSortedIntegrationActionsNames,
} from 'pages/tickets/common/utils'
import {getActionTemplate} from 'utils'

describe('getPersonLabelFromSource()', () => {
    it('should return email label', () => {
        const person = {address: 'foo@bar.com', name: 'Foo Bar'}
        const sourceType = TicketMessageSourceType.Email

        const label = getPersonLabelFromSource(person, sourceType)

        expect(label).toBe('Foo Bar (foo@bar.com)')
    })

    it('should return phone label', () => {
        const person = {address: '+12133734253', name: 'Foo Bar'}
        const sourceType = TicketMessageSourceType.Phone

        const label = getPersonLabelFromSource(person, sourceType)

        expect(label).toBe('Foo Bar (+1 213 373 4253)')
    })
})

const integrationActions = [
    getActionTemplate(MacroActionName.ShopifyCancelLastOrder)!,
    getActionTemplate(MacroActionName.ShopifyCancelOrder)!,
    getActionTemplate(MacroActionName.ShopifyEditShippingAddressLastOrder)!,
    getActionTemplate(MacroActionName.RechargeCancelLastSubscription)!,
    getActionTemplate(MacroActionName.RechargeActivateLastSubscription)!,
]

describe('getSortedIntegrationActionsNames', () => {
    it('should return sorted integration actions names', () => {
        const sortedIntegrationActions =
            getSortedIntegrationActionsNames(integrationActions)

        expect(sortedIntegrationActions.toJS()).toMatchSnapshot()
    })
})

describe('getSortedIntegrationActions', () => {
    it('should return sorted integration actions names', () => {
        const sortedIntegrationActions = getSortedIntegrationActions(
            integrationActions as MacroAction[]
        )

        expect(
            Object.entries<ActionTemplate[]>(sortedIntegrationActions).reduce(
                (acc, [key, value]) => {
                    return {...acc, [key]: value.map((action) => action.name)}
                },
                {}
            )
        ).toMatchSnapshot()
    })
})
