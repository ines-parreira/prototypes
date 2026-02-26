import { useCallback, useMemo, useState } from 'react'

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

import type {
    GetInvoices200,
    GetInvoicesParams,
    HttpError,
    HttpResponse,
} from '@gorgias/helpdesk-client'
import { getInvoices } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

import GorgiasApi from 'services/gorgiasApi'
import type { Invoice } from 'state/billing/types'

type UseInvoicePaymentReturn = {
    confirmPayment: (invoice: Invoice) => Promise<void>
    retryPayment: (invoice: Invoice) => Promise<void>
    invoiceBeingPaid: Invoice | null
    invoices: Invoice[]
    isLoading: boolean
    hasNextPage: boolean
    hasPrevPage: boolean
    goToNextPage: () => void
    goToPrevPage: () => void
    resetPagination: () => void
}

export const useInvoicePayment = (): UseInvoicePaymentReturn => {
    const queryClient = useQueryClient()
    const gorgiasApi = useMemo(() => new GorgiasApi(), [])

    const [invoiceBeingPaid, setInvoiceBeingPaid] = useState<Invoice | null>(
        null,
    )
    const [currentPageIndex, setCurrentPageIndex] = useState(0)

    const {
        data: invoicesResponse,
        isFetching,
        isLoading,
        fetchNextPage,
        hasNextPage: hasNextPageFromQuery,
    } = useInfiniteQuery<HttpResponse<GetInvoices200>, HttpError<unknown>>({
        queryKey: [...queryKeys.billing.getInvoices(), 'paginated'],
        queryFn: ({ pageParam, signal }) =>
            getInvoices(
                {
                    limit: 20,
                    cursor: pageParam,
                } as GetInvoicesParams,
                { signal },
            ),
        getNextPageParam: (lastPage) => lastPage?.data?.meta?.next_cursor,
    })

    const pages = invoicesResponse?.pages ?? []
    const currentPage = pages[currentPageIndex]
    const invoices = (currentPage?.data?.data ?? []) as unknown as Invoice[]

    const hasPrevPage = currentPageIndex > 0
    const hasNextPage =
        currentPageIndex < pages.length - 1 || Boolean(hasNextPageFromQuery)

    const goToNextPage = useCallback(() => {
        if (currentPageIndex < pages.length - 1) {
            setCurrentPageIndex((prev) => prev + 1)
            return
        }

        if (hasNextPageFromQuery) {
            void fetchNextPage().then(() => {
                setCurrentPageIndex((prev) => prev + 1)
            })
        }
    }, [currentPageIndex, pages.length, hasNextPageFromQuery, fetchNextPage])

    const goToPrevPage = useCallback(() => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex((prev) => prev - 1)
        }
    }, [currentPageIndex])

    const resetPagination = useCallback(() => {
        setCurrentPageIndex(0)
    }, [])

    const confirmPayment = useCallback(
        async (invoice: Invoice) => {
            setInvoiceBeingPaid(invoice)

            try {
                const newInvoice: Invoice = (
                    await gorgiasApi.confirmInvoicePayment(invoice.id)
                ).toJS()
                if (newInvoice.payment_confirmation_url) {
                    window.location.href = newInvoice.payment_confirmation_url
                } else {
                    await queryClient.invalidateQueries({
                        queryKey: queryKeys.billing.getInvoices(),
                    })
                }
            } finally {
                setInvoiceBeingPaid(null)
            }
        },
        [gorgiasApi, queryClient],
    )

    const retryPayment = useCallback(
        async (invoice: Invoice) => {
            setInvoiceBeingPaid(invoice)

            try {
                await gorgiasApi.payInvoice(invoice.id)
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.billing.getInvoices(),
                })
            } catch (error) {
                const responseError = error as { response?: { status: number } }

                if (responseError.response?.status === 402) {
                    await confirmPayment(invoice)
                    return
                }
                throw error
            } finally {
                setInvoiceBeingPaid(null)
            }
        },
        [gorgiasApi, confirmPayment, queryClient],
    )

    const isPageLoading = (isFetching || isLoading) && !!currentPage

    return {
        confirmPayment,
        retryPayment,
        invoiceBeingPaid,
        invoices,
        isLoading: isPageLoading,
        hasNextPage,
        hasPrevPage,
        goToNextPage,
        goToPrevPage,
        resetPagination,
    }
}
