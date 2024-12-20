import {
    EmailDomain,
    useGetEmailIntegrationDomain,
    useUpdateEmailIntegrationDomain,
    useVerifyEmailIntegrationDomain,
} from '@gorgias/api-queries'
import React, {
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useInterval from 'hooks/useInterval'
import useLocalStorage from 'hooks/useLocalStorage'
import {DEFAULT_EMAIL_DKIM_KEY_SIZE} from 'models/integration/constants'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {
    isCommonDomain,
    parseRecordsCurrentValues,
    populateCurrentValuesForDNSRecords,
} from '../helpers'
import {DomainVerificationContext} from './DomainVerificationContext'

type Props = {
    children: ReactNode
    domainName: string
}

const DOMAIN_VERIFICATION_TIMEOUT_IN_SECONDS = 60
const DOMAIN_REFETCH_INTERVAL = 5000

export const domainVerificationStorageKey = (domainName: string) =>
    `email-domain-verification-requested-at-${domainName}`

export default function DomainVerificationProvider({
    children,
    domainName,
}: Props) {
    const dispatch = useAppDispatch()

    const {
        isPending: isRequestPending,
        isRequested,
        setRequestedAt,
    } = useRequestStatus(domainName)

    const {
        data,
        isLoading: isFetching,
        error: domainError,
        refetch: refetchDomain,
    } = useGetEmailIntegrationDomain(domainName, {
        query: {
            refetchInterval: DOMAIN_REFETCH_INTERVAL,
        },
    })

    const {
        mutate: createDomain,
        isLoading: isCreatingDomain,
        error: domainCreationError,
    } = useUpdateEmailIntegrationDomain({
        mutation: {
            onSuccess: () => refetchDomain(),
        },
    })

    const isCommonDomainAddress = isCommonDomain(domainName)

    const [domain, setDomain] = useState<EmailDomain | undefined>()

    const isPending = isRequestPending && !domain?.verified

    useEffect(() => {
        if (
            domainError?.status === 404 &&
            !isCreatingDomain &&
            !domainCreationError &&
            !isCommonDomainAddress
        ) {
            createDomain({
                domainName,
                data: {dkim_key_size: DEFAULT_EMAIL_DKIM_KEY_SIZE},
            })
        }
    }, [
        domainError,
        createDomain,
        domainName,
        domain,
        isCreatingDomain,
        domainCreationError,
        isCommonDomainAddress,
    ])

    useEffect(() => {
        const transformDomainRecords = async () => {
            const domain = data?.data

            if (!domain) {
                return
            }

            const recordsWithCurrentValues =
                await populateCurrentValuesForDNSRecords(
                    domain.data?.sending_dns_records ?? []
                )
            const records = parseRecordsCurrentValues(recordsWithCurrentValues)

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

    const verifyDomain = useCallback(() => {
        triggerVerify({domainName})
    }, [triggerVerify, domainName])

    return (
        <DomainVerificationContext.Provider
            value={{
                domain,
                verifyDomain,
                isRequested,
                isVerifying,
                isFetching,
                isPending,
                isCreatingDomain,
                errors: {
                    createDomain: domainCreationError,
                },
            }}
        >
            {children}
        </DomainVerificationContext.Provider>
    )
}

function useRequestStatus(domainName: string) {
    const [requestedAt, setRequestedAt] = useLocalStorage<Date | null>(
        domainVerificationStorageKey(domainName),
        null
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
    requestedAt: Date | null,
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
