import { PhoneFunction, PhoneIntegration } from '@gorgias/api-queries'
import { validatePhoneIntegrationMeta } from '@gorgias/api-validators'

import { toFormErrors } from 'core/forms'

export const getDefaultValues = () => {
    return {
        name: '',
        meta: {
            emoji: null,
            function: PhoneFunction.Standard,
            send_calls_to_voicemail: false,
        },
    }
}

export const validateOnboardingForm = (values: PhoneIntegration) => {
    let nameErrors = {}
    if (!values.name) {
        nameErrors = { name: 'Name is required' }
    }
    const metaErrors = toFormErrors(validatePhoneIntegrationMeta(values.meta))
    if (!values.meta.phone_number_id) {
        metaErrors.phone_number_id = 'Phone number is required'
    }

    return {
        ...nameErrors,
        ...(Object.keys(metaErrors).length > 0 ? { meta: metaErrors } : {}),
    }
}
