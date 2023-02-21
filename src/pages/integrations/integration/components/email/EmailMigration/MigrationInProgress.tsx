import React, {useState} from 'react'

enum VerificationStep {
    InboundVerification = 'InboundVerification',
    DomainVerification = 'DomainVerification',
}

export default function MigrationInProgress() {
    const [currentStep] = useState()

    return (
        <div data-testid="migration-pending">
            {currentStep === VerificationStep.InboundVerification && (
                <div>Inbound verification</div>
            )}
            {currentStep === VerificationStep.DomainVerification && (
                <div>Domain verification</div>
            )}
        </div>
    )
}
