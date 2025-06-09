import { useHistory } from 'react-router-dom'

import {
    CreateIntegrationBody,
    PhoneFunction,
    PhoneIntegration,
    useCreateIntegration,
} from '@gorgias/helpdesk-queries'
import { validatePhoneIntegrationMeta } from '@gorgias/helpdesk-validators'

import { toFormErrors } from 'core/forms'
import useAppDispatch from 'hooks/useAppDispatch'
import { useNotify } from 'hooks/useNotify'
import { DEFAULT_IVR_SETTINGS } from 'models/integration/constants'
import { fetchIntegrations } from 'state/integrations/actions'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'

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

function getSubmittableValues(values: PhoneIntegration) {
    const { meta } = values

    if (meta.function === PhoneFunction.Ivr) {
        return {
            ...values,
            meta: {
                ...meta,
                ivr: DEFAULT_IVR_SETTINGS,
            },
        }
    }

    return values
}

export const useOnboardingForm = () => {
    const notify = useNotify()
    const history = useHistory()
    const dispatch = useAppDispatch()

    const { mutate: createIntegration } = useCreateIntegration({
        mutation: {
            onSuccess: (response) => {
                notify.success(`${response.data.name} successfully created.`)

                dispatch(fetchIntegrations())
                history.push(PHONE_INTEGRATION_BASE_URL)
            },
            onError: () => {
                notify.error(
                    "We couldn't save your preferences. Please try again.",
                )
            },
        },
    })

    const onSubmit = (data: PhoneIntegration) => {
        createIntegration({
            data: getSubmittableValues(data) as CreateIntegrationBody,
        })
    }

    return { onSubmit }
}
