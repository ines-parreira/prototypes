import axios from 'axios'
import {isEmpty} from 'lodash'

import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import {
    EmailIntegrationDefaultProviderSetting,
    EmailProvider,
} from 'models/integration/constants'
import {
    EmailIntegration,
    GmailIntegration,
    Integration,
    IntegrationType,
    OutlookIntegration,
    OutboundVerificationStatusValue,
    DomainDNSRecord,
    DNSRecordType,
} from 'models/integration/types'

export const isSingleSenderVerificationInProgress = (
    integration: EmailIntegration
): boolean => {
    const verificationStatus =
        integration.meta.outbound_verification_status?.single_sender
    return (
        verificationStatus === OutboundVerificationStatusValue.Pending ||
        verificationStatus === OutboundVerificationStatusValue.Failure
    )
}

export const isOutboundDomainVerified = (
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
): boolean => {
    return (
        integration.meta?.outbound_verification_status?.domain ===
        OutboundVerificationStatusValue.Success
    )
}

export const isSingleSenderVerified = (
    integration: EmailIntegration
): boolean => {
    return (
        integration.meta.outbound_verification_status?.single_sender ===
        OutboundVerificationStatusValue.Success
    )
}

export const isOutboundVerifiedSendgrid = (
    integration: EmailIntegration
): boolean => {
    return (
        isOutboundDomainVerified(integration) ||
        isSingleSenderVerified(integration)
    )
}

export const getDomainFromEmailAddress = (address: string): string =>
    address.substring(address.lastIndexOf('@') + 1)

export const isSendgridEmailIntegration = (
    integration: Integration
): boolean => {
    return (
        integration.type === IntegrationType.Email &&
        integration.meta?.provider === EmailProvider.Sendgrid
    )
}

export const isGenericEmailIntegration = (
    integration: Integration
): integration is EmailIntegration | GmailIntegration | OutlookIntegration => {
    return (EMAIL_INTEGRATION_TYPES as IntegrationType[]).includes(
        integration.type
    )
}

export const isBaseEmailAddress = (emailAddress: string): boolean => {
    const forwardingEmailAddress =
        window.GORGIAS_STATE?.integrations?.authentication?.email
            ?.forwarding_email_address
    const forwardingAddressDomain = getDomainFromEmailAddress(
        forwardingEmailAddress ?? '@'
    )

    return emailAddress.endsWith(`@${forwardingAddressDomain}`)
}

export const isBaseEmailIntegration = (
    emailIntegration: EmailIntegration | GmailIntegration | OutlookIntegration
): boolean => {
    return isBaseEmailAddress(emailIntegration.meta.address)
}

export const canEnableEmailingViaInternalProvider = (
    emailIntegration: GmailIntegration | OutlookIntegration
): boolean => {
    return isOutboundDomainVerified(emailIntegration)
}

export const outboundEmailProviderSettingByIntegrationType = {
    [IntegrationType.Gmail]:
        EmailIntegrationDefaultProviderSetting.SendViaGmail,
    [IntegrationType.Outlook]:
        EmailIntegrationDefaultProviderSetting.SendViaOutlook,
}

export function getOutboundEmailProviderSettingKey(
    integrationType: IntegrationType.Gmail | IntegrationType.Outlook
) {
    return outboundEmailProviderSettingByIntegrationType[integrationType]
}

export function removeDomainFromDNSRecord(
    record: DomainDNSRecord,
    domain?: string
): DomainDNSRecord {
    if (!domain) {
        return record
    }
    const host = record.host.replace(domain, '').replace(/\.$/, '') || '@'
    return {...record, host}
}

export function removeDomainFromDNSRecords(
    records: DomainDNSRecord[],
    domain?: string
): DomainDNSRecord[] {
    return records.map((record) => removeDomainFromDNSRecord(record, domain))
}

export async function populateCurrentValuesForDNSRecords(
    records: DomainDNSRecord[]
): Promise<DomainDNSRecord[]> {
    try {
        return Promise.all(
            records.map((record) => {
                return getDNSRecord(record.host, record.record_type)
                    .then((response) => {
                        if (!isEmpty(response)) {
                            return {
                                ...record,
                                current_values:
                                    response?.map((answer) =>
                                        record.record_type.toLowerCase() ===
                                        DNSRecordType.CNAME
                                            ? answer.data.replace(/\.$/, '')
                                            : answer.data
                                    ) ?? [],
                            }
                        }

                        return record
                    })
                    .catch(() => record)
            })
        )
    } catch (e) {
        return records
    }
}

export type DNSQueryResponse = {
    Status: number
    Question: Array<{name: string; type: number}>
    Answer: Array<DNSQueryAnswer>
}

export type DNSQueryAnswer = {
    name: string
    type: number
    TTL: number
    data: string
}

export async function getDNSRecord(
    name: string,
    type: string
): Promise<DNSQueryAnswer[] | null> {
    const GOOGLE_DNS_URL = 'https://dns.google/resolve'
    try {
        //eslint-disable-next-line no-restricted-properties
        const response = await axios.get<DNSQueryResponse>(GOOGLE_DNS_URL, {
            params: {name, type},
        })

        if (!response || response?.data?.Status !== 0) {
            return null
        }

        return response.data.Answer
    } catch (error) {
        return null
    }
}
