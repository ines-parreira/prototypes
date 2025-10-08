import BackLink from 'pages/settings/new_billing/components/BackLink'
import { BillingInformationFields } from 'pages/settings/new_billing/components/BillingInformationFields/BillingInformationFields'
import { BillingInformationSetupForm } from 'pages/settings/new_billing/components/BillingInformationSetupForm/BillingInformationSetupForm'
import { FormSubmitButton } from 'pages/settings/new_billing/components/FormSubmitButton/FormSubmitButton'
import { PartnerFields } from 'pages/settings/new_billing/views/PaymentInformationView/components/PartnerFields'
import { BillingContactDetailResponse } from 'state/billing/types'

import css from './FormContainer.less'

export const FormContainer: React.FC<{
    billingInformation: BillingContactDetailResponse
}> = ({ billingInformation }) => {
    return (
        <BillingInformationSetupForm billingInformation={billingInformation}>
            <BackLink />
            <div className={css.container}>
                <BillingInformationFields />
                <PartnerFields />
            </div>
            <FormSubmitButton className={css.submitButton}>
                Save Billing Information
            </FormSubmitButton>
        </BillingInformationSetupForm>
    )
}
