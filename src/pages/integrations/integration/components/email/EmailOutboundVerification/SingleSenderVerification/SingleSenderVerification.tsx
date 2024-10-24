import {AxiosError} from 'axios'
import React from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import useEffectOnce from 'hooks/useEffectOnce'
import {
    EmailIntegration,
    OutboundVerificationStatusValue,
} from 'models/integration/types'
import {getVerification} from 'models/singleSenderVerification/resources'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import {setVerification} from 'state/entities/singleSenderVerification/actions'
import {getSingleSenderVerification} from 'state/entities/singleSenderVerification/selectors'
import {fetchIntegration, fetchIntegrations} from 'state/integrations/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import useCreateSingleSenderVerification from '../../hooks/useCreateSingleSenderVerification'
import BackButton from '../BackButton'
import DeleteVerificationButton from '../DeleteVerificationButton'
import VerificationForm from '../VerificationForm/VerificationForm'
import VerificationEmailSent from './VerificationEmailSent'

export type Props = {
    baseURL: string
    integration: EmailIntegration
}

export default function SingleSenderVerification({
    baseURL,
    integration,
}: Props) {
    const {createVerification, isLoading} = useCreateSingleSenderVerification()
    const verification = useAppSelector(
        getSingleSenderVerification(integration.id)
    )

    const dispatch = useAppDispatch()

    const integrationMetaVerificationStatus =
        integration.meta?.outbound_verification_status.single_sender
    const isVerificationCreated =
        integrationMetaVerificationStatus !==
        OutboundVerificationStatusValue.Unverified
    const isVerificationConfirmed =
        integrationMetaVerificationStatus ===
        OutboundVerificationStatusValue.Success

    const refreshIntegration = () => {
        void fetchIntegration(`${integration.id}`, integration.type)(dispatch)
        void dispatch(fetchIntegrations())
    }

    const handleDelete = () => {
        refreshIntegration()
        history.push(baseURL)
    }

    const [{loading: isLoadingVerification}, loadVerification] =
        useAsyncFn(async () => {
            try {
                const response = await getVerification(integration.id)
                dispatch(setVerification(response))
            } catch (error) {
                const {response} = error as AxiosError<{error: {msg: string}}>
                const errorMsg =
                    response && response.data.error
                        ? response.data.error.msg
                        : 'Failed to retrieve verification'
                history.push(baseURL)
                void dispatch(
                    notify({
                        message: errorMsg,
                        status: NotificationStatus.Error,
                    })
                )
            }
        }, [dispatch, verification])

    useEffectOnce(() => {
        if (isVerificationCreated) {
            void loadVerification()
        }
    })

    if (!verification && isLoadingVerification) return <Loader />

    return (
        <div>
            <BackButton baseURL={baseURL} />
            {!isVerificationCreated && (
                <div data-testid="create-verification-step">
                    <p className="mb-4">
                        Enter the mailing address associated with your business.
                    </p>
                    <VerificationForm
                        initialValues={{email: integration.meta.address}}
                        isLoading={isLoading}
                        showSubmitButton
                        onSubmit={async (values) => {
                            await createVerification(integration.id, values)
                            refreshIntegration()
                        }}
                    />
                </div>
            )}
            {isVerificationCreated &&
                verification &&
                !isVerificationConfirmed && (
                    <VerificationEmailSent
                        onConfirmDeleteVerification={handleDelete}
                        verification={verification}
                        baseURL={baseURL}
                        onVerificationUpdate={refreshIntegration}
                        refetchVerification={loadVerification}
                        provider={integration.meta.provider}
                    />
                )}
            {isVerificationConfirmed && verification && (
                <div data-testid="verification-confirmed-step">
                    <h3 className="mb-2">Single Sender Details</h3>
                    <p className="mb-4">
                        To make changes to your Single Sender details, delete
                        verification and re-verify it with updated contact
                        information.
                    </p>
                    <VerificationForm
                        isFormDisabled
                        initialValues={verification}
                    />
                    <div className="mt-5">
                        <DeleteVerificationButton
                            verification={verification}
                            onConfirm={handleDelete}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
