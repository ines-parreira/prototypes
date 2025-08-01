import { assumeMock, renderHook } from '@repo/testing'
import { UseInfiniteQueryResult } from '@tanstack/react-query'

import { useGetContactFromIntegrationIdsForStore } from 'hooks/contacForm/useGetContactForms'
import { useGetContactFormList } from 'pages/settings/contactForm/queries'

jest.mock('pages/settings/contactForm/queries', () => ({
    useGetContactFormList: jest.fn(),
}))
const useGetContactFormListMock = assumeMock(useGetContactFormList)

describe('useGetContactFromIntegrationIdsForStore', () => {
    const mockContactForms = {
        status: 'success',
        data: {
            pages: [
                {
                    data: [
                        {
                            integration_id: 1,
                            shop_integration: {
                                shop_name: 'shop1',
                            },
                            email_integration: { id: 101 },
                        },
                        {
                            integration_id: 2,
                            shop_integration: {
                                shop_name: 'shop2',
                            },
                            email_integration: { id: 102 },
                        },
                        {
                            integration_id: 3,
                            shop_integration: {
                                shop_name: 'shop1',
                            },
                            email_integration: { id: 103 },
                        },
                    ],
                },
            ],
        },
    } as unknown as UseInfiniteQueryResult

    beforeEach(() => {
        useGetContactFormListMock.mockReturnValue(mockContactForms)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return contact form integration ids for the given shop name', () => {
        const { result } = renderHook(() =>
            useGetContactFromIntegrationIdsForStore({ shopName: 'shop1' }),
        )
        expect(result.current).toEqual({
            contactFormIntegrationsWithName: [
                { id: 1, channel: 'contact_form' },
                { id: 3, channel: 'contact_form' },
            ],
            contactFormIntegrationsWithoutName: [
                { id: 2, email_id: 102, channel: 'contact_form' },
            ],
        })
    })

    it('should return an empty array if no contact forms match the shop name', () => {
        const { result } = renderHook(() =>
            useGetContactFromIntegrationIdsForStore({ shopName: 'shop3' }),
        )
        expect(result.current).toEqual({
            contactFormIntegrationsWithName: [],
            contactFormIntegrationsWithoutName: [
                { id: 1, email_id: 101, channel: 'contact_form' },
                { id: 2, email_id: 102, channel: 'contact_form' },
                { id: 3, email_id: 103, channel: 'contact_form' },
            ],
        })
    })
})
