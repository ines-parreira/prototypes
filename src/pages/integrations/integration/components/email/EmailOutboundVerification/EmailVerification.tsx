import React, {useState} from 'react'
import Alert from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Tooltip from 'pages/common/components/Tooltip'
import history from 'pages/history'
import {EmailIntegration} from 'models/integration/types'
import VerificationCardFooter from './VerificationCard/VerificationCardFooter'
import VerificationCard from './VerificationCard/VerificationCard'

type Props = {
    baseURL: string
    integration: EmailIntegration
}

export default function EmailVerification({baseURL, integration}: Props) {
    const [showAlert, setShowAlert] = useState(true)

    const isDomainVerified = false

    const handleVerifyDomainClick = () => {
        // TODO
    }
    const handleVerifySingleSenderClick = () => {
        history.push(`${baseURL}/single-sender`)
    }

    return (
        <>
            {showAlert && (
                <Alert
                    icon
                    onClose={() => setShowAlert(false)}
                    className="mb-5"
                >
                    To send outbound messages,{' '}
                    <strong>email verification is required</strong> through
                    Single Sender or Domain Verification.{' '}
                    <a
                        href="https://docs.gorgias.com/en-US/email-integrations-81753"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Learn more about verification
                    </a>
                    .
                </Alert>
            )}

            <VerificationCard
                header={
                    <div className="d-flex align-items-center">
                        <h3>Domain Verification</h3>
                        <Badge className="ml-2" type={ColorType.Purple}>
                            Recommended
                        </Badge>
                    </div>
                }
                body={
                    <>
                        Send emails from <strong>any email address</strong> on
                        your domain. A verified domain improves email
                        deliverability.
                    </>
                }
                bodyActions={
                    !isDomainVerified && (
                        <Button onClick={handleVerifyDomainClick}>
                            Verify domain
                        </Button>
                    )
                }
                footer={
                    <VerificationCardFooter
                        label="TODO.com"
                        icon="language"
                        isVerified={isDomainVerified}
                        onClick={handleVerifyDomainClick}
                    />
                }
            />
            <VerificationCard
                header={<h3>Single Sender Verification</h3>}
                body={
                    <>
                        Send emails using a{' '}
                        <strong>single email address</strong> on your domain.
                        Single Sender is a quick way to get started and is
                        recommended for testing purposes.
                    </>
                }
                bodyActions={
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
                                Delete Domain verification to send emails with a
                                Single Sender.
                            </Tooltip>
                        )}
                    </>
                }
                footer={
                    <VerificationCardFooter
                        label={integration.meta.address}
                        icon="email"
                        isVerified={false}
                        onClick={handleVerifySingleSenderClick}
                    />
                }
            />
        </>
    )
}
