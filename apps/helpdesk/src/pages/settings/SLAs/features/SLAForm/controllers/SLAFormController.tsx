import {
    FeatureFlagKey,
    useAreFlagsLoading,
    useFlag,
} from '@repo/feature-flags'
import { toFormErrors } from '@repo/forms'
import { useLocation, useParams } from 'react-router-dom'

import { useGetSlaPolicy } from '@gorgias/helpdesk-queries'
import { validateCreateSLAPolicy } from '@gorgias/helpdesk-validators'

import type { SLATemplate } from 'pages/settings/SLAs/config/templates'
import Loader from 'pages/settings/SLAs/features/Loader/Loader'

import DEPRECATED_SLAFormView from '../views/DEPRECATED_SLAFormView'
import { SLAFormView } from '../views/SLAFormView'
import makeCreateSLAPolicyBody from './makeCreateSLAPolicyBody'
import makeMappedFormSLAPolicy from './makeMappedFormSLAPolicy'
import type { SLAFormValues } from './useFormValues'
import useFormValues from './useFormValues'
import useSubmitPolicy from './useSubmitPolicy'

export default function SLAFormController() {
    const { policyId } = useParams<{ policyId?: string }>()
    const location = useLocation<{
        template?: SLATemplate
    }>()
    const isVoiceSLAEnabled = useFlag(FeatureFlagKey.VoiceSLA, false)
    const areFlagsLoading = useAreFlagsLoading()

    const isNewPolicy = policyId === 'new'
    const { data, isLoading } = useGetSlaPolicy(
        isNewPolicy ? '' : policyId || '',
        {
            query: {
                select: (data) => {
                    return makeMappedFormSLAPolicy(data?.data)
                },
                staleTime: Infinity,
                refetchOnMount: 'always',
                refetchOnWindowFocus: false,
            },
        },
    )
    const template = location.state?.template
        ? {
              ...location.state.template,
              name: '',
          }
        : undefined

    const defaultValues = useFormValues()
    const values = useFormValues(data ?? template)

    const validator = (values: SLAFormValues) => {
        return toFormErrors(
            validateCreateSLAPolicy(makeCreateSLAPolicyBody(values)),
        )
    }

    const { save, isLoading: isSubmitting } = useSubmitPolicy()

    const handleFormSubmit = (data: SLAFormValues) => {
        void save(data)
    }

    return (
        <>
            {(isLoading && !isNewPolicy) || areFlagsLoading ? (
                <Loader />
            ) : isVoiceSLAEnabled ? (
                <SLAFormView
                    policy={data}
                    defaultValues={defaultValues}
                    values={values}
                    onSubmit={handleFormSubmit}
                    isLoading={isSubmitting}
                    validator={validator}
                />
            ) : (
                <DEPRECATED_SLAFormView
                    policy={data}
                    defaultValues={defaultValues}
                    values={values}
                    onSubmit={handleFormSubmit}
                    isLoading={isSubmitting}
                    validator={validator}
                />
            )}
        </>
    )
}
