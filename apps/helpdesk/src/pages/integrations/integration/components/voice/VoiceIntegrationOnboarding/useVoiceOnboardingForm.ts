import { toFormErrors } from '@repo/forms'
import { useHistory } from 'react-router-dom'

import type {
    CreateIntegrationBody,
    HttpResponse,
    PhoneIntegration,
} from '@gorgias/helpdesk-queries'
import { useCreateIntegration } from '@gorgias/helpdesk-queries'
import { validatePhoneIntegrationMeta } from '@gorgias/helpdesk-validators'

import useAppDispatch from 'hooks/useAppDispatch'
import { useNotify } from 'hooks/useNotify'
import { isGorgiasApiError } from 'models/api/types'
import { fetchIntegrations } from 'state/integrations/actions'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import { SUCCESSFUL_ONBOARDING_PARAM } from './constants'

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

export const useOnboardingForm = () => {
    const notify = useNotify()
    const history = useHistory()
    const dispatch = useAppDispatch()

    const { mutate: createIntegration } = useCreateIntegration({
        mutation: {
            onSuccess: (response) => {
                const params = new URLSearchParams({
                    [SUCCESSFUL_ONBOARDING_PARAM]: response.data.id.toString(),
                })

                dispatch(fetchIntegrations())
                history.push({
                    pathname: PHONE_INTEGRATION_BASE_URL,
                    search: params?.toString(),
                })
            },
            onError: (error: HttpResponse<unknown>) => {
                const message = isGorgiasApiError(error)
                    ? error.response.data.error.msg
                    : "We couldn't save your preferences. Please try again."

                notify.error(message)
            },
        },
    })

    const onSubmit = (data: PhoneIntegration) => {
        createIntegration({
            data: data as CreateIntegrationBody,
        })
    }

    return { onSubmit }
}
