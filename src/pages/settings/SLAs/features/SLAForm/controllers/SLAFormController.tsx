import React from 'react'
import {useParams} from 'react-router-dom'
import {useGetSlaPolicy} from '@gorgias/api-queries'

import Loader from 'pages/settings/SLAs/features/Loader/Loader'

import SLAFormView from '../views/SLAFormView'

import makeMappedFormSLAPolicy, {
    MappedFormSLAPolicy,
} from './makeMappedFormSLAPolicy'
import useDefaultFormValues from './useDefaultFormValues'
import useSubmitPolicy from './useSubmitPolicy'

export default function SLAFormController() {
    const {policyId} = useParams<{policyId?: string}>()
    const isNewPolicy = policyId === 'new'
    const {data, isLoading} = useGetSlaPolicy(
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
        }
    )

    const defaultValues = useDefaultFormValues(data)

    const {save, isLoading: isSubmitting} = useSubmitPolicy()

    const handleFormSubmit = (data: MappedFormSLAPolicy) => {
        void save(data)
    }

    return (
        <>
            {isLoading && !isNewPolicy ? (
                <Loader />
            ) : (
                <SLAFormView
                    policy={data}
                    defaultValues={defaultValues}
                    onSubmit={handleFormSubmit}
                    isLoading={isSubmitting}
                />
            )}
        </>
    )
}
