import { TaxIdField } from 'pages/settings/new_billing/components/BillingInformationFields/components/TaxIdField'
import { TaxIdType } from 'state/billing/types'

export const GSTHSTField: React.FC = () => {
    return (
        <TaxIdField
            type={TaxIdType.ca_gst_hst}
            label="GST/HST ID"
            placeholder="e.g. 123456789RT0001"
            instructions="Enter a valid 9-digit GST/HST number followed by 'RT' and four additional numbers (e.g., 123456789RT0001)."
            pattern={/^(\d{9}RT\d{4})?$/}
            tooltip="Software-as-a-Service products like Gorgias are subject to Goods and Services Tax (GST) / Harmonized Sales Tax (HST) in Canada. Gorgias will pass this ID info to Stripe, who will generate valid tax invoices for your records."
        />
    )
}
