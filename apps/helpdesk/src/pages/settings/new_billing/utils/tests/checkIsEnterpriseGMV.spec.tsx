import type { CustomerSummary } from '@gorgias/helpdesk-types'
import { CustomerFixedGmvBand } from '@gorgias/helpdesk-types'

import checkIsEnterpriseGMV from 'pages/settings/new_billing/utils/checkIsEnterpriseGMV'

describe('checkIsEnterpriseGMV', () => {
    it.each([
        [CustomerFixedGmvBand.NamedAccounts, true],
        [CustomerFixedGmvBand.Enterprise, true],
        [CustomerFixedGmvBand.Commercial, false],
        [CustomerFixedGmvBand.Smb, false],
    ])('should return %s for %s customer', (gmvBand, expected) => {
        const customer = {
            fixed_gmv_band: gmvBand,
        } as CustomerSummary

        expect(checkIsEnterpriseGMV(customer)).toBe(expected)
    })

    it.each([
        ['null', null],
        ['undefined', undefined],
        ['missing property', {}],
    ])('should return false when fixed_gmv_band is %s', (_, customerData) => {
        const customer = customerData as CustomerSummary
        expect(checkIsEnterpriseGMV(customer)).toBe(false)
    })

    it.each([
        ['null', null],
        ['undefined', undefined],
    ])('should return false when customer is %s', (_, customer) => {
        expect(checkIsEnterpriseGMV(customer as any)).toBe(false)
    })
})
