import {filterTaxIdsByAddress} from 'pages/settings/new_billing/utils/filterTaxIdsByAddress'
import {BillingContactUpdatePayload, TaxIdType} from 'state/billing/types'

describe('filterTaxIdsByAddress', () => {
    const mockTaxIds: BillingContactUpdatePayload['tax_ids'] = {
        [TaxIdType.eu_vat]: 'FRAB123456789',
        [TaxIdType.au_abn]: '12345678912',
        [TaxIdType.ca_gst_hst]: '123456789RT0002',
        [TaxIdType.ca_pst_bc]: 'PST-1234-5678',
        [TaxIdType.ca_pst_sk]: '1234567',
        [TaxIdType.ca_pst_mb]: '123456-7',
        [TaxIdType.ca_qst]: '1234567890TQ1234',
    }

    it('should return EU VAT tax ID for a valid European country', () => {
        expect(
            filterTaxIdsByAddress(mockTaxIds, {
                country: 'FR',
            })
        ).toEqual({
            [TaxIdType.eu_vat]: 'FRAB123456789',
            [TaxIdType.au_abn]: undefined,
            [TaxIdType.ca_gst_hst]: undefined,
            [TaxIdType.ca_pst_bc]: undefined,
            [TaxIdType.ca_pst_sk]: undefined,
            [TaxIdType.ca_pst_mb]: undefined,
            [TaxIdType.ca_qst]: undefined,
        })
    })

    it('should return AU ABN tax ID for Australia', () => {
        expect(
            filterTaxIdsByAddress(mockTaxIds, {
                country: 'AU',
                state: 'VIC',
            })
        ).toEqual({
            [TaxIdType.eu_vat]: undefined,
            [TaxIdType.au_abn]: '12345678912',
            [TaxIdType.ca_gst_hst]: undefined,
            [TaxIdType.ca_pst_bc]: undefined,
            [TaxIdType.ca_pst_sk]: undefined,
            [TaxIdType.ca_pst_mb]: undefined,
            [TaxIdType.ca_qst]: undefined,
        })
    })

    it('should return CA GST/HST tax ID for Canada without state restriction', () => {
        expect(
            filterTaxIdsByAddress(mockTaxIds, {
                country: 'CA',
                state: 'ON',
            })
        ).toEqual({
            [TaxIdType.eu_vat]: undefined,
            [TaxIdType.au_abn]: undefined,
            [TaxIdType.ca_gst_hst]: '123456789RT0002',
            [TaxIdType.ca_pst_bc]: undefined,
            [TaxIdType.ca_pst_sk]: undefined,
            [TaxIdType.ca_pst_mb]: undefined,
            [TaxIdType.ca_qst]: undefined,
        })
    })

    it('should return CA GST/HST tax ID, and PST BC tax ID for British Columbia, Canada', () => {
        expect(
            filterTaxIdsByAddress(mockTaxIds, {
                country: 'CA',
                state: 'BC',
            })
        ).toEqual({
            [TaxIdType.eu_vat]: undefined,
            [TaxIdType.au_abn]: undefined,
            [TaxIdType.ca_gst_hst]: '123456789RT0002',
            [TaxIdType.ca_pst_bc]: 'PST-1234-5678',
            [TaxIdType.ca_pst_sk]: undefined,
            [TaxIdType.ca_pst_mb]: undefined,
            [TaxIdType.ca_qst]: undefined,
        })
    })

    it('should return CA GST/HST tax ID, and QST tax ID for Quebec, Canada', () => {
        expect(
            filterTaxIdsByAddress(mockTaxIds, {
                country: 'CA',
                state: 'QC',
            })
        ).toEqual({
            [TaxIdType.eu_vat]: undefined,
            [TaxIdType.au_abn]: undefined,
            [TaxIdType.ca_gst_hst]: '123456789RT0002',
            [TaxIdType.ca_pst_bc]: undefined,
            [TaxIdType.ca_pst_sk]: undefined,
            [TaxIdType.ca_pst_mb]: undefined,
            [TaxIdType.ca_qst]: '1234567890TQ1234',
        })
    })

    it('should filter out all tax IDs if country and state do not match any validation', () => {
        expect(
            filterTaxIdsByAddress(mockTaxIds, {
                country: 'US',
                state: 'CA',
            })
        ).toEqual({
            [TaxIdType.eu_vat]: undefined,
            [TaxIdType.au_abn]: undefined,
            [TaxIdType.ca_gst_hst]: undefined,
            [TaxIdType.ca_pst_bc]: undefined,
            [TaxIdType.ca_pst_sk]: undefined,
            [TaxIdType.ca_pst_mb]: undefined,
            [TaxIdType.ca_qst]: undefined,
        })
    })
})
