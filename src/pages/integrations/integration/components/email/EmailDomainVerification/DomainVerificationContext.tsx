import {EmailDomain, HttpError} from '@gorgias/api-queries'
import {createContext} from 'react'

export type DomainVerificationContextState = {
    verifyDomain: () => void
    domain: EmailDomain | undefined
    isRequested: boolean
    isVerifying: boolean
    isFetching: boolean
    isPending: boolean
    isCreatingDomain: boolean
    domainCreationError?: HttpError | null
}

export const DomainVerificationContext =
    createContext<DomainVerificationContextState | null>(null)
