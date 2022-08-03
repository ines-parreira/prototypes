import {fromJS} from 'immutable'
import {TicketMessageSourceType} from 'business/types/ticket'
import {MacroActionName} from 'models/macroAction/types'
import {
    getPersonLabelFromSource,
    getSortedIntegrationActions,
    getSortedIntegrationActionsNames,
} from 'pages/tickets/common/utils'
import {getActionTemplate} from 'utils'
import {ActionTemplate} from 'config'

describe('getPersonLabelFromSource()', () => {
    it('should return email label', () => {
        const person = {address: 'foo@bar.com', name: 'Foo Bar'}
        const sourceType = TicketMessageSourceType.Email

        const label = getPersonLabelFromSource(person, sourceType)

        expect(label).toMatchSnapshot()
    })

    it('should return phone label', () => {
        const person = {address: '+14151235555', name: 'Foo Bar'}
        const sourceType = TicketMessageSourceType.Phone

        const label = getPersonLabelFromSource(person, sourceType)

        expect(label).toMatchSnapshot()
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
            fromJS(integrationActions)
        )

        expect(
            Object.entries<ActionTemplate[]>(
                sortedIntegrationActions.toJS()
            ).reduce((acc, [key, value]) => {
                return {...acc, [key]: value.map((action) => action.name)}
            }, {})
        ).toMatchSnapshot()
    })
})
