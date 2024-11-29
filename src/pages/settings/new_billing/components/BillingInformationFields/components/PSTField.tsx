import React from 'react'
import {useWatch} from 'react-hook-form'

import {TaxIdField} from 'pages/settings/new_billing/components/BillingInformationFields/components/TaxIdField'

import {TaxIdType} from 'state/billing/types'

export const PSTField: React.FC = () => {
    const province: string = useWatch({name: 'address.address.state'})

    if (province === 'BC') {
        return (
            <TaxIdField
                type={TaxIdType.ca_pst_bc}
                label="PST ID"
                placeholder="e.g. PST-1234-5678"
                instructions="For British Columbia, enter PST followed by 8 digits with hyphens (e.g., PST-1234-5678)."
                pattern={/^(PST-\d{4}-\d{4})?$/}
                tooltip="Software-as-a-Service products like Gorgias are subject to Provincial Sales Tax (PST) for businesses operating in British Columbia, Saskatchewan, Manitoba, and Quebec. Gorgias will pass this ID info to Stripe, who will generate valid tax invoices for your records."
            />
        )
    }

    if (province === 'SK') {
        return (
            <TaxIdField
                type={TaxIdType.ca_pst_sk}
                label="PST ID"
                placeholder="e.g. 1234567"
                instructions="For Saskatchewan, enter 7 digits with no spaces or hyphens (e.g., 1234567)."
                pattern={/^(\d{7})?$/}
                tooltip="Software-as-a-Service products like Gorgias are subject to Provincial Sales Tax (PST) for businesses operating in British Columbia, Saskatchewan, Manitoba, and Quebec. Gorgias will pass this ID info to Stripe, who will generate valid tax invoices for your records."
            />
        )
    }

    if (province === 'MB') {
        return (
            <TaxIdField
                type={TaxIdType.ca_pst_mb}
                label="PST ID"
                placeholder="e.g. 123456-7"
                instructions="For Manitoba, enter 7 digits with a hyphen before the last digit (e.g., 123456-7)."
                pattern={/^(\d{6}-\d)?$/}
                tooltip="Software-as-a-Service products like Gorgias are subject to Provincial Sales Tax (PST) for businesses operating in British Columbia, Saskatchewan, Manitoba, and Quebec. Gorgias will pass this ID info to Stripe, who will generate valid tax invoices for your records."
            />
        )
    }

    if (province === 'QC') {
        return (
            <TaxIdField
                type={TaxIdType.ca_qst}
                label="QST ID"
                placeholder="e.g. 1234567890TQ0001"
                instructions="For Quebec, enter 10 digits followed by TQ and 4 digits (e.g., 1234567890TQ0001)."
                pattern={/^(\d{10}TQ\d{4})?$/}
                tooltip="Software-as-a-Service products like Gorgias are subject to Quebec Sales Tax (QST) for businesses operating in Quebec. Gorgias will pass this ID info to Stripe, who will generate valid tax invoices for your records."
            />
        )
    }

    return null
}
