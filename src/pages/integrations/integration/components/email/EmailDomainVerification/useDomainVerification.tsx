import {useCallback, useEffect, useMemo, useState} from 'react'

import {
    EmailDomain,
    useDeleteEmailIntegrationDomain,
    useGetEmailIntegrationDomain,
    useVerifyEmailIntegrationDomain,
} from '@gorgias/api-queries'
import {notify} from 'state/notifications/actions'
import useLocalStorage from 'hooks/useLocalStorage'
import useAppDispatch from 'hooks/useAppDispatch'
import {NotificationStatus} from 'state/notifications/types'
import useInterval from 'hooks/useInterval'
import {populateCurrentValuesForDNSRecords} from '../helpers'

const DOMAIN_VERIFICATION_TIMEOUT_IN_SECONDS = 60
const DOMAIN_REFETCH_INTERVAL = 5000

export const domainVerificationStorageKey = (domainName: string) =>
    `email-domain-verification-requested-at-${domainName}`

export type UseDomainVerificationRequestHookResult = {
    verifyDomain: () => void
    deleteDomain: () => void
    domain: EmailDomain | undefined
    isRequested: boolean
    isVerifying: boolean
    isFetching: boolean
    isDeleting: boolean
    isPending: boolean
}

export type UseDomainVerificationRequestHookOptions = {
    onDelete?: () => void
    onVerify?: () => void
}

export function useDomainVerification(
    domainName: string,
    options?: UseDomainVerificationRequestHookOptions
): UseDomainVerificationRequestHookResult {
    const dispatch = useAppDispatch()

    const {
        isPending: isRequestPending,
        isRequested,
        setRequestedAt,
    } = useRequestStatus(domainName)

    const {data, isLoading: isFetching} = useGetEmailIntegrationDomain(
        domainName,
        {
            query: {
                refetchInterval: DOMAIN_REFETCH_INTERVAL,
            },
        }
    )

    const [domain, setDomain] = useState<EmailDomain | undefined>()

    const isPending = isRequestPending && !domain?.verified

    useEffect(() => {
        const transformDomainRecords = async () => {
            const domain = data?.data

            if (!domain) {
                return
            }

            const records = await populateCurrentValuesForDNSRecords(
                domain.data?.sending_dns_records ?? []
            )

            setDomain({
                ...domain,
                data: {
                    ...domain.data,
                    sending_dns_records: records,
                },
            } as EmailDomain)
        }
        void transformDomainRecords()
    }, [data?.data])

    const {mutate: triggerVerify, isLoading: isVerifying} =
        useVerifyEmailIntegrationDomain({
            mutation: {
                onSuccess: async () => {
                    options?.onVerify?.()
                    setRequestedAt(new Date())
                    await dispatch(
                        notify({
                            message:
                                'The status of your domain verification is being checked.',
                            status: NotificationStatus.Success,
                        })
                    )
                },
                onError: async () => {
                    await dispatch(
                        notify({
                            message:
                                'Requesting a domain verification failed. Please try again.',
                            status: NotificationStatus.Error,
                        })
                    )
                },
            },
        })

    const {mutate: triggerDelete, isLoading: isDeleting} =
        useDeleteEmailIntegrationDomain({
            mutation: {
                onSuccess: () => {
                    setDomain(undefined)
                    options?.onDelete?.()
                },
            },
        })

    const verifyDomain = useCallback(() => {
        triggerVerify({domainName})
    }, [triggerVerify, domainName])

    const deleteDomain = useCallback(() => {
        triggerDelete({domainName})
    }, [triggerDelete, domainName])

    return {
        domain,
        verifyDomain,
        deleteDomain,
        isRequested,
        isVerifying,
        isFetching,
        isDeleting,
        isPending,
    }
}

function useRequestStatus(domainName: string) {
    const [requestedAt, setRequestedAt] = useLocalStorage<Date | undefined>(
        domainVerificationStorageKey(domainName)
    )

    const [currentTime, setCurrentTime] = useState(new Date())

    const isRequested = !!requestedAt
    const isPending = useMemo(
        () => computeIsPending(requestedAt, currentTime),
        [requestedAt, currentTime]
    )

    useInterval(() => {
        setCurrentTime(new Date())
    }, DOMAIN_VERIFICATION_TIMEOUT_IN_SECONDS * 1000)

    return {isPending, isRequested, setRequestedAt}
}

export function computeIsPending(
    requestedAt: Date | undefined,
    currentTime: Date
): boolean {
    if (!requestedAt) {
        return false
    }

    return (
        (new Date(currentTime).getTime() - new Date(requestedAt).getTime()) /
            1000 <
        DOMAIN_VERIFICATION_TIMEOUT_IN_SECONDS
    )
}
