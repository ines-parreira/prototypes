import React, {useEffect, useState} from 'react'
import {Col, Container} from 'reactstrap'
import {useAsyncFn, useEffectOnce} from 'react-use'
import {AxiosError} from 'axios'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import settingsCss from 'pages/settings/settings.less'
import {fetchMigrations} from 'models/integration/resources/email'
import Loader from 'pages/common/components/Loader/Loader'
import {EmailMigration} from 'models/integration/types'
import MigrationEmailForwarding from './MigrationEmailForwarding'
import {getInboundUnverifiedMigrations} from './utils'

enum VerificationStep {
    InboundVerification = 'InboundVerification',
    DomainVerification = 'DomainVerification',
}

export default function MigrationInProgress() {
    const [currentStep, setCurrentStep] = useState<VerificationStep>()
    const [migrations, setMigrations] = useState<EmailMigration[]>([])

    const dispatch = useAppDispatch()

    const inboundUnverifiedMigrations =
        getInboundUnverifiedMigrations(migrations)

    const [{loading}, loadMigrations] = useAsyncFn(async () => {
        try {
            const response = await fetchMigrations()
            setMigrations(response.data)
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>
            const errorMsg =
                response && response.data.error
                    ? response.data.error.msg
                    : 'Failed to start migration'
            void dispatch(
                notify({
                    message: errorMsg,
                    status: NotificationStatus.Error,
                })
            )
        }
    })

    useEffectOnce(() => {
        void loadMigrations()
    })

    /* default to "Email forwarding" step when there are migrations
     * that are not inbound verified when first loading the page */
    useEffect(() => {
        if (migrations.length && !currentStep) {
            setCurrentStep(
                inboundUnverifiedMigrations.length
                    ? VerificationStep.InboundVerification
                    : VerificationStep.DomainVerification
            )
        }
    }, [inboundUnverifiedMigrations, setCurrentStep, currentStep, migrations])

    if (loading) return <Loader />

    return (
        <div data-testid="migration-pending">
            <Container fluid className={settingsCss.pageContainer}>
                <Col lg={6} xl={7} className="mb-5">
                    NAVIGATION BAR HERE
                </Col>

                {currentStep === VerificationStep.InboundVerification && (
                    <MigrationEmailForwarding
                        migrations={inboundUnverifiedMigrations}
                    />
                )}
                {currentStep === VerificationStep.DomainVerification && (
                    <div data-testid="migration-domain-verification">
                        Domain verification
                    </div>
                )}
            </Container>
        </div>
    )
}
