import {
    EmailIntegration,
    OutboundVerificationStatusValue,
    OutboundVerificationType,
} from 'models/integration/types'

const checkIsOutboundVerificationInProgressByType = (
    integration: EmailIntegration,
    verificationType: OutboundVerificationType
): boolean => {
    const verificationStatus =
        integration.meta.outbound_verification_status?.[verificationType]
    return (
        verificationStatus === OutboundVerificationStatusValue.Pending ||
        verificationStatus === OutboundVerificationStatusValue.Failure
    )
}

export const isSingleSenderVerificationInProgress = (
    integration: EmailIntegration
): boolean => {
    return checkIsOutboundVerificationInProgressByType(
        integration,
        OutboundVerificationType.SingleSender
    )
}

export const isOutboundDomainVerificationInProgress = (
    integration: EmailIntegration
): boolean => {
    return checkIsOutboundVerificationInProgressByType(
        integration,
        OutboundVerificationType.Domain
    )
}

export const isOutboundVerificationInProgress = (
    integration: EmailIntegration
): boolean => {
    return (
        isSingleSenderVerificationInProgress(integration) ||
        isOutboundDomainVerificationInProgress(integration)
    )
}
