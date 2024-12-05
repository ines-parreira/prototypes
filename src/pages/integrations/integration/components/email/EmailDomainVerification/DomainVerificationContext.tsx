import {EmailDomain, HttpError} from '@gorgias/api-queries'
import {createContext} from 'react'

type DomainVerificationErrors = {
    createDomain: HttpError | null
}

export type DomainVerificationContextState = {
    verifyDomain: () => void
    domain: EmailDomain | undefined
    isRequested: boolean
    isVerifying: boolean
    isFetching: boolean
    isPending: boolean
    isCreatingDomain: boolean
    errors: DomainVerificationErrors
}

export const DomainVerificationContext =
    createContext<DomainVerificationContextState | null>(null)
