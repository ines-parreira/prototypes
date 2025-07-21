import { TaxIdFields } from 'pages/settings/new_billing/components/BillingInformationFields/components/TaxIdFields'
import { EmailField } from 'pages/settings/new_billing/components/EmailField/EmailField'
import { StripeAddressFields } from 'pages/settings/new_billing/components/StripeAddressFields/StripeAddressFields'

import css from './BillingInformationFields.less'

export const BillingInformationFields = ({
    title,
}: {
    title?: string | null
}) => {
    return (
        <>
            {title !== null ? (
                <h1 className={css.title}>{title ?? 'Billing Information'}</h1>
            ) : null}
            <EmailField />
            <StripeAddressFields />
            <TaxIdFields />
        </>
    )
}
