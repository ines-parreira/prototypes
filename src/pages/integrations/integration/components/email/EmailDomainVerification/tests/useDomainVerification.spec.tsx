import React from 'react'

import { renderHook } from 'utils/testing/renderHook'

import { DomainVerificationContext } from '../DomainVerificationContext'
import useDomainVerification from '../useDomainVerification'

describe('useDomainVerification', () => {
    it('should throw an error if it is used outside of the provider', () => {
        const { result } = renderHook(() => useDomainVerification())

        expect(result.error).toEqual(
            new Error(
                'useDomainVerification must be used within a DomainVerificationProvider',
            ),
        )
    })

    it('should return domain verification context', () => {
        const domain = {
            domain: 'domain',
            isFetching: false,
            errors: { createDomain: undefined },
        }

        const { result } = renderHook(() => useDomainVerification(), {
            wrapper: ({ children }: any) => (
                <DomainVerificationContext.Provider value={domain as any}>
                    {children}
                </DomainVerificationContext.Provider>
            ),
        })

        expect(result.current).toEqual(domain)
    })
})
