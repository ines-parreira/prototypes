import { useEffect, useState } from 'react'

import { useAsyncFn, useEffectOnce } from '@repo/hooks'
import type { AxiosError } from 'axios'
import { Col, Container } from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { fetchMigrations } from 'models/integration/resources/email'
import Loader from 'pages/common/components/Loader/Loader'
import settingsCss from 'pages/settings/settings.less'
import { SET_EMAIL_PROVIDER_MIGRATIONS } from 'state/integrations/constants'
import { getEmailMigrations } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import SteppedNavBar from '../SteppedNavBar/SteppedNavBar'
import MigrationEmailForwarding from './MigrationEmailForwarding'
import MigrationOutboundVerification from './MigrationOutboundVerification'
import { getInboundUnverifiedMigrations } from './utils'

enum VerificationStep {
    InboundVerification = 0,
    DomainVerification = 1,
}

export default function MigrationInProgress() {
    const [currentStep, setCurrentStep] = useState<VerificationStep | null>(
        null,
    )
    const migrations = useAppSelector(getEmailMigrations)

    const dispatch = useAppDispatch()

    const inboundUnverifiedMigrations =
        getInboundUnverifiedMigrations(migrations)

    const [{ loading }, loadMigrations] = useAsyncFn(async () => {
        try {
            const response = await fetchMigrations()
            dispatch({
                type: SET_EMAIL_PROVIDER_MIGRATIONS,
                emailMigrations: response.data,
            })
        } catch (error) {
            const { response } = error as AxiosError<{ error: { msg: string } }>
            const errorMsg =
                response && response.data.error
                    ? response.data.error.msg
                    : 'Failed to fetch migrations'
            void dispatch(
                notify({
                    message: errorMsg,
                    status: NotificationStatus.Error,
                }),
            )
        }
    })

    useEffectOnce(() => {
        void loadMigrations()
    })

    const isInboundVerificationStepComplete =
        !inboundUnverifiedMigrations.length

    /* default to "Email forwarding" step when there are migrations
     * that are not inbound verified when first loading the page */
    useEffect(() => {
        if (migrations.length && currentStep === null) {
            setCurrentStep(
                isInboundVerificationStepComplete
                    ? VerificationStep.DomainVerification
                    : VerificationStep.InboundVerification,
            )
        }
    }, [
        isInboundVerificationStepComplete,
        setCurrentStep,
        currentStep,
        migrations,
    ])

    if (loading) return <Loader />

    return (
        <div data-testid="migration-pending">
            <Container fluid className={settingsCss.pageContainer}>
                <Col lg={6} xl={7} className="mb-5">
                    {currentStep !== null && (
                        <SteppedNavBar
                            activeStep={currentStep}
                            steps={[
                                {
                                    name: 'Email forwarding',
                                    isComplete:
                                        isInboundVerificationStepComplete,
                                },
                                {
                                    name: 'Outbound verification',
                                    isComplete: false,
                                },
                            ]}
                        />
                    )}
                </Col>

                {currentStep === VerificationStep.InboundVerification && (
                    <MigrationEmailForwarding
                        migrations={inboundUnverifiedMigrations}
                        onNextClick={() =>
                            setCurrentStep(VerificationStep.DomainVerification)
                        }
                    />
                )}
                {currentStep === VerificationStep.DomainVerification && (
                    <MigrationOutboundVerification
                        onBackClick={() =>
                            setCurrentStep(VerificationStep.InboundVerification)
                        }
                    />
                )}
            </Container>
        </div>
    )
}
