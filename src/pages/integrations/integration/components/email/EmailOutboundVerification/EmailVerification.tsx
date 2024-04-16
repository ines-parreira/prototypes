import React, {useState} from 'react'
import Alert from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Tooltip from 'pages/common/components/Tooltip'
import history from 'pages/history'
import {EmailIntegration} from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'
import {
    getDomainFromEmailAddress,
    isBaseEmailIntegration,
    isOutboundDomainVerified,
    isSingleSenderVerified as checkIsSingleSenderVerified,
} from '../helpers'
import VerificationCardFooter from './VerificationCard/VerificationCardFooter'
import VerificationCard from './VerificationCard/VerificationCard'

export type Props = {
    baseURL: string
    integration: EmailIntegration
    loading: boolean
}

export default function EmailVerification({
    baseURL,
    integration,
    loading,
}: Props) {
    const [showAlert, setShowAlert] = useState(true)

    const isDomainVerified = isOutboundDomainVerified(integration)
    const isSingleSenderVerified = checkIsSingleSenderVerified(integration)
    const isBaseIntegration = isBaseEmailIntegration(integration)

    const domain = getDomainFromEmailAddress(integration.meta.address)

    const handleVerifyDomainClick = () => {
        history.push(`${baseURL}/domain`)
    }

    const handleVerifySingleSenderClick = () => {
        history.push(`${baseURL}/single-sender`)
    }

    if (loading) return <Loader />

    return (
        <>
            {showAlert && !isBaseIntegration && (
                <Alert
                    icon
                    onClose={() => setShowAlert(false)}
                    className="mb-5"
                >
                    To send outbound messages via Gorgias with your email
                    address,{' '}
                    <strong>you need to complete Domain Verification</strong>.{' '}
                    <a
                        href="https://docs.gorgias.com/email-integrations/spf-dkim-support"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Learn more about Domain Verification
                    </a>
                    .
                </Alert>
            )}

            {isBaseIntegration && (
                <Alert className="mb-5" icon>
                    Outbound verification is not available for base email
                    integrations.
                </Alert>
            )}

            <VerificationCard
                isDisabled={isBaseIntegration}
                header={
                    <div className="d-flex align-items-center">
                        <h3>Domain Verification</h3>
                        {!isDomainVerified && (
                            <Badge className="ml-2" type={ColorType.LightError}>
                                Required
                            </Badge>
                        )}
                    </div>
                }
                body={
                    <>
                        Send emails from <strong>any email address</strong> on
                        your domain. A verified domain is{' '}
                        <strong>required</strong> to guarantee the
                        deliverability of your email.
                    </>
                }
                bodyActions={
                    !isDomainVerified &&
                    !isBaseIntegration && (
                        <Button
                            onClick={handleVerifyDomainClick}
                            isDisabled={isBaseIntegration}
                        >
                            Verify domain
                        </Button>
                    )
                }
                footer={
                    <VerificationCardFooter
                        label={domain}
                        icon="language"
                        isVerified={isDomainVerified && !isBaseIntegration}
                        isDisabled={isBaseIntegration}
                        showStatus={!isBaseIntegration}
                        onClick={handleVerifyDomainClick}
                    />
                }
            />
            <VerificationCard
                isDisabled={isBaseIntegration}
                header={<h3>Single Sender Verification</h3>}
                body={
                    <>
                        Send emails using a{' '}
                        <strong>single email address</strong>. Single Sender is
                        a quick way to get started and is recommended{' '}
                        <strong>only for testing purposes</strong>.
                    </>
                }
                bodyActions={
                    !isSingleSenderVerified &&
                    !isBaseIntegration && (
                        <>
                            {/* wrap button into div to enable tooltip when button is disabled */}
                            <div id="verify-single-sender">
                                <Button
                                    onClick={handleVerifySingleSenderClick}
                                    isDisabled={isDomainVerified}
                                >
                                    Verify single sender
                                </Button>
                            </div>
                            {isDomainVerified && (
                                <Tooltip target="verify-single-sender">
                                    This email’s domain has already been
                                    verified through Domain Verification. <br />
                                    Therefore, Single Sender verification is not
                                    required.
                                </Tooltip>
                            )}
                        </>
                    )
                }
                footer={
                    <VerificationCardFooter
                        label={integration.meta.address}
                        icon="email"
                        isVerified={isSingleSenderVerified}
                        isDisabled={isBaseIntegration}
                        onClick={handleVerifySingleSenderClick}
                        showStatus={
                            !isBaseIntegration &&
                            (isSingleSenderVerified || !isDomainVerified)
                        }
                    />
                }
            />
        </>
    )
}
