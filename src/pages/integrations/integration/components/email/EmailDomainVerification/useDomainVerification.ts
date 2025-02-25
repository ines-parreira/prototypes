import { useContext } from 'react'

import { DomainVerificationContext } from './DomainVerificationContext'

export default function useDomainVerification() {
    const context = useContext(DomainVerificationContext)

    if (context === null) {
        throw new Error(
            'useDomainVerification must be used within a DomainVerificationProvider',
        )
    }

    return context
}
