import type { ComponentProps } from 'react'

import { appQueryClient } from '@repo/api-resources'
import { act, render, renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { useCustomerProfileActions } from 'pages/common/components/infobar/Infobar/useCustomerProfileActions'
import type Modal from 'pages/common/components/modal/Modal'
import type ModalHeader from 'pages/common/components/modal/ModalHeader'

const customer = {
    id: 7,
    name: 'Grace Hopper',
    email: 'grace@example.com',
} as TicketCustomer

jest.mock('pages/common/components/modal/Modal', () => {
    return ({ isOpen, onClose, children }: ComponentProps<typeof Modal>) =>
        isOpen ? (
            <div role="dialog">
                <button type="button" onClick={onClose}>
                    Close modal
                </button>
                {children}
            </div>
        ) : null
})

jest.mock('pages/common/components/modal/ModalHeader', () => {
    return ({ title }: ComponentProps<typeof ModalHeader>) => <h2>{title}</h2>
})

jest.mock('pages/customers/common/components/CustomerForm', () => {
    return ({ onSuccess }: { onSuccess?: () => void }) => (
        <button
            type="button"
            onClick={() => {
                onSuccess?.()
            }}
        >
            Save customer
        </button>
    )
})

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/CustomerSyncForm/CustomerSyncForm',
    () => {
        return ({
            setIsCustomerSyncFormOpen,
        }: {
            setIsCustomerSyncFormOpen: (isOpen: boolean) => void
        }) => (
            <div role="dialog" aria-label="Sync customer">
                <button
                    type="button"
                    onClick={() => {
                        setIsCustomerSyncFormOpen(true)
                    }}
                >
                    Keep sync form open
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setIsCustomerSyncFormOpen(false)
                    }}
                >
                    Close sync form
                </button>
            </div>
        )
    },
)

describe('useCustomerProfileActions', () => {
    let invalidateQueriesSpy: jest.SpiedFunction<
        typeof appQueryClient.invalidateQueries
    >

    beforeEach(() => {
        invalidateQueriesSpy = jest
            .spyOn(appQueryClient, 'invalidateQueries')
            .mockResolvedValue(undefined as never)
    })

    afterEach(() => {
        invalidateQueriesSpy.mockRestore()
    })

    it('refreshes the customer query cache after editing a customer from a ticket', async () => {
        const { result } = renderHook(() => useCustomerProfileActions(), {
            initialEntries: ['/app/ticket/123'],
            path: '/app/ticket/:ticketId',
        })

        act(() => {
            result.current.handleEditCustomer(customer)
        })

        const { user } = render(
            <>{result.current.customerProfileActionModals}</>,
        )
        await user.click(screen.getByRole('button', { name: 'Save customer' }))

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: queryKeys.customers.getCustomer(customer.id),
        })
        expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1)
    })

    it('closes the customer edit modal', async () => {
        const { result } = renderHook(() => useCustomerProfileActions(), {
            initialEntries: ['/app/ticket/123'],
            path: '/app/ticket/:ticketId',
        })

        act(() => {
            result.current.handleEditCustomer(customer)
        })

        const { rerender, user } = render(
            <>{result.current.customerProfileActionModals}</>,
        )

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: 'Close modal' }),
            )
        })
        rerender(<>{result.current.customerProfileActionModals}</>)

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('does not refresh the customer query cache when the edited customer has no id', async () => {
        const customerWithoutId = {
            name: '',
            email: 'grace@example.com',
        } as TicketCustomer

        const { result } = renderHook(() => useCustomerProfileActions(), {
            initialEntries: ['/app/ticket/123'],
            path: '/app/ticket/:ticketId',
        })

        act(() => {
            result.current.handleEditCustomer(customerWithoutId)
        })

        const { user } = render(
            <>{result.current.customerProfileActionModals}</>,
        )

        expect(
            screen.getByRole('heading', { name: 'Update customer' }),
        ).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Save customer' }))

        expect(invalidateQueriesSpy).not.toHaveBeenCalled()
    })

    it('opens and closes the customer sync form', async () => {
        const { result } = renderHook(() => useCustomerProfileActions(), {
            initialEntries: ['/app/ticket/123'],
            path: '/app/ticket/:ticketId',
        })

        act(() => {
            result.current.handleSyncToShopify(customer)
        })

        const { rerender, user } = render(
            <>{result.current.customerProfileActionModals}</>,
        )

        expect(
            screen.getByRole('dialog', { name: 'Sync customer' }),
        ).toBeInTheDocument()

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: 'Keep sync form open' }),
            )
        })
        rerender(<>{result.current.customerProfileActionModals}</>)

        expect(
            screen.getByRole('dialog', { name: 'Sync customer' }),
        ).toBeInTheDocument()

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: 'Close sync form' }),
            )
        })
        rerender(<>{result.current.customerProfileActionModals}</>)

        expect(
            screen.queryByRole('dialog', { name: 'Sync customer' }),
        ).not.toBeInTheDocument()
    })
})
