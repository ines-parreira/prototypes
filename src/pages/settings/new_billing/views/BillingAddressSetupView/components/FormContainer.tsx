import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import BackLink from 'pages/settings/new_billing/components/BackLink'
import {BillingInformationFields} from 'pages/settings/new_billing/components/BillingInformationFields/BillingInformationFields'
import {BillingInformationSetupForm} from 'pages/settings/new_billing/components/BillingInformationSetupForm/BillingInformationSetupForm'
import {FormSubmitButton} from 'pages/settings/new_billing/components/FormSubmitButton/FormSubmitButton'

import {BillingContactDetailResponse} from 'state/billing/types'

import css from './FormContainer.less'

export const FormContainer: React.FC<{
    billingInformation: BillingContactDetailResponse
}> = ({billingInformation}) => {
    const isTaxIdFieldEnabled = useFlags()[FeatureFlagKey.BillingTaxIdField]

    return (
        <BillingInformationSetupForm billingInformation={billingInformation}>
            <BackLink />
            <div className={css.container}>
                <BillingInformationFields />
            </div>
            <FormSubmitButton className={css.submitButton}>
                {isTaxIdFieldEnabled
                    ? 'Save Billing Information'
                    : 'Set Address'}
            </FormSubmitButton>
        </BillingInformationSetupForm>
    )
}
