import React from 'react'

import {DataRow} from 'pages/settings/new_billing/views/PaymentInformationView/components/DataRow'
import {BillingContactDetailResponse} from 'state/billing/types'

export type ITaxIdRowsProps = {
    taxIDs: BillingContactDetailResponse['tax_ids']
    address: {
        country?: string | null
        state?: string | null
    }
}

export const TaxIdRows: React.FC<ITaxIdRowsProps> = ({taxIDs, address}) => {
    const country = address.country
    const state = address.state

    switch (country) {
        case '':
        case undefined:
        case null:
            return <DataRow label="Sales Tax ID" value="" />
        case 'CA':
            return (
                <>
                    <DataRow
                        label="GST/HST ID"
                        value={taxIDs?.ca_gst_hst?.value}
                    />
                    <CanadaProvinceTaxIdRow taxIDs={taxIDs} province={state} />
                </>
            )
        case 'AU':
            return <DataRow label="ABN" value={taxIDs?.au_abn?.value} />
        default:
            if (isEuropeVAT(country)) {
                return (
                    <DataRow label="VAT Number" value={taxIDs?.eu_vat?.value} />
                )
            }

            return null
    }
}

const CanadaProvinceTaxIdRow: React.FC<{
    taxIDs: BillingContactDetailResponse['tax_ids']
    province?: string | null
}> = ({taxIDs, province}) => {
    switch (province) {
        case 'QC':
            return <DataRow label="QST ID" value={taxIDs?.ca_qst?.value} />
        case 'BC':
            return <DataRow label="PST ID" value={taxIDs?.ca_pst_bc?.value} />
        case 'MB':
            return <DataRow label="PST ID" value={taxIDs?.ca_pst_mb?.value} />
        case 'SK':
            return <DataRow label="PST ID" value={taxIDs?.ca_pst_sk?.value} />
        default:
            return null
    }
}

const isEuropeVAT = (countryCode: string) =>
    [
        'AT',
        'BE',
        'BG',
        'CY',
        'CZ',
        'DE',
        'DK',
        'EE',
        'ES',
        'FI',
        'FR',
        'GR',
        'HR',
        'HU',
        'IE',
        'IT',
        'LT',
        'LU',
        'LV',
        'MT',
        'NL',
        'PL',
        'PT',
        'RO',
        'SE',
        'SI',
        'SK',
    ].includes(countryCode)
