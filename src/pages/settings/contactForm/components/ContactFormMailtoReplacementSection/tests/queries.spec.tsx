import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { HelpCenterClient } from 'rest_api/help_center_api/client'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    useGetContactFormMailtoReplacementConfig,
    useUpsertContactFormMailtoReplacementConfig,
} from '../queries'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

const queryClient = mockQueryClient()
const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const contactFormId = 1
const mockUseHelpCenterApi = jest.mocked(useHelpCenterApi)

describe('queries', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    describe('useGetContactFormMailtoReplacementConfig', () => {
        it('should return undefined when client not set', async () => {
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: true,
            })

            const { result } = renderHook(
                () => useGetContactFormMailtoReplacementConfig(contactFormId),
                { wrapper },
            )

            await waitFor(() => expect(result.current.data).toBeUndefined())
        })

        it('should return correct data on success', async () => {
            const emails = ['test@mail.com']
            mockUseHelpCenterApi.mockReturnValue({
                client: {
                    getContactFormMailtoReplacementConfig: () =>
                        Promise.resolve({ data: { emails } }),
                } as HelpCenterClient,
                isReady: true,
            })

            const { result } = renderHook(
                () => useGetContactFormMailtoReplacementConfig(contactFormId),
                { wrapper },
            )

            await waitFor(() => expect(result.current.data).toEqual({ emails }))
        })
    })

    describe('useUpsertContactFormMailtoReplacementConfig', () => {
        it('should return undefined when client not set', async () => {
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: true,
            })

            const { result } = renderHook(
                () => useUpsertContactFormMailtoReplacementConfig(),
                { wrapper },
            )

            await result.current.mutateAsync([
                undefined,
                { contact_form_id: contactFormId },
                { emails: [] },
            ])

            await waitFor(() => expect(result.current.data).toBeUndefined())
        })

        it('should return correct data on success', async () => {
            const emails = ['test@mail.com']
            const statusCode = 201
            mockUseHelpCenterApi.mockReturnValue({
                client: {
                    upsertContactFormShopifyMailtoReplacement: () =>
                        Promise.resolve({
                            data: { emails },
                            status: statusCode,
                        }),
                } as HelpCenterClient,
                isReady: true,
            })

            const { result } = renderHook(
                () => useUpsertContactFormMailtoReplacementConfig(),
                { wrapper },
            )

            await result.current.mutateAsync([
                undefined,
                { contact_form_id: contactFormId },
                { emails },
            ])

            await waitFor(() =>
                expect(result.current.data).toEqual({
                    data: { emails },
                    statusCode,
                }),
            )
        })
    })
})
