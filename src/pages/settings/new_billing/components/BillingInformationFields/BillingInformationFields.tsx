import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {TaxIdFields} from 'pages/settings/new_billing/components/BillingInformationFields/components/TaxIdFields'
import {EmailField} from 'pages/settings/new_billing/components/EmailField/EmailField'
import {StripeAddressFields} from 'pages/settings/new_billing/components/StripeAddressFields/StripeAddressFields'

import css from './BillingInformationFields.less'

export const BillingInformationFields: React.FC = () => {
    const isTaxIdFieldEnabled = useFlags()[FeatureFlagKey.BillingTaxIdField]

    return (
        <>
            <h1 className={css.title}>Billing Information</h1>
            <EmailField />
            <StripeAddressFields />
            {isTaxIdFieldEnabled ? <TaxIdFields /> : null}
        </>
    )
}
