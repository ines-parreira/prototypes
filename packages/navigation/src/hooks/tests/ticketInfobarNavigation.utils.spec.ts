import { TicketInfobarTab } from '../../constants'
import type { NavigationState } from '../../types'
import { toggleEditShopifyFields } from '../ticketInfobarNavigation.utils'

const baseState: NavigationState = {
    ticketInfobar: {
        activeTab: TicketInfobarTab.Customer,
        isExpanded: true,
        isEditShopifyFieldsOpen: false,
    },
}

describe('toggleEditShopifyFields', () => {
    it('sets isEditShopifyFieldsOpen to true and activeTab to Shopify when open=true', () => {
        const result = toggleEditShopifyFields(baseState, true)
        expect(result.ticketInfobar.isEditShopifyFieldsOpen).toBe(true)
        expect(result.ticketInfobar.activeTab).toBe(TicketInfobarTab.Shopify)
    })

    it('sets isEditShopifyFieldsOpen to false and does not change activeTab when open=false', () => {
        const openState: NavigationState = {
            ticketInfobar: {
                activeTab: TicketInfobarTab.Shopify,
                isExpanded: true,
                isEditShopifyFieldsOpen: true,
            },
        }
        const result = toggleEditShopifyFields(openState, false)
        expect(result.ticketInfobar.isEditShopifyFieldsOpen).toBe(false)
        expect(result.ticketInfobar.activeTab).toBe(TicketInfobarTab.Shopify)
    })

    it('preserves other state fields', () => {
        const result = toggleEditShopifyFields(baseState, true)
        expect(result.ticketInfobar.isExpanded).toBe(true)
    })

    it('does not mutate the original state', () => {
        const original = structuredClone(baseState)
        toggleEditShopifyFields(baseState, true)
        expect(baseState).toEqual(original)
    })
})
