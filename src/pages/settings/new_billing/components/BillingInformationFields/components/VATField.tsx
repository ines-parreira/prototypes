import React from 'react'

import { TaxIdField } from 'pages/settings/new_billing/components/BillingInformationFields/components/TaxIdField'
import { TaxIdType } from 'state/billing/types'

export const VATField: React.FC<{ country: string }> = ({ country }) => (
    <TaxIdField
        type={TaxIdType.eu_vat}
        label="VAT Number"
        placeholder="e.g. 1234567"
        instructions="Enter your VAT number which will include your country code followed by up to 12 characters."
        pattern={new RegExp(`^(${country}[0-Z]{8,12})?$`)}
        tooltip={
            <>
                <p>
                    Software-as-a-Service products like Gorgias are subject to
                    Value-Added Tax (VAT) for European customers. Gorgias will
                    pass this ID info to Stripe, who will generate valid tax
                    invoices for your records.
                </p>
                <p>
                    Contact your country’s tax authority to find your VAT
                    number.
                </p>
            </>
        }
    />
)
