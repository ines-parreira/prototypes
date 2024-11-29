import React from 'react'

import {TaxIdField} from 'pages/settings/new_billing/components/BillingInformationFields/components/TaxIdField'

import {TaxIdType} from 'state/billing/types'

export const ABNField: React.FC = () => (
    <TaxIdField
        type={TaxIdType.au_abn}
        label="ABN Number"
        placeholder="e.g. 12345678912"
        instructions="Enter your 11 digit ABN number."
        pattern={/^(\d{11})?$/}
        tooltip={
            <>
                <p>
                    Software-as-a-Service products like Gorgias are subject to
                    Goods and Services Tax (GST) for Australian customers.
                    Gorgias will pass your Australian Business Number (ABN) to
                    Stripe, who will generate valid tax invoices for your
                    records.
                </p>
                <p>
                    Contact the Australian Taxation Office to locate your ABN.
                </p>
            </>
        }
    />
)
