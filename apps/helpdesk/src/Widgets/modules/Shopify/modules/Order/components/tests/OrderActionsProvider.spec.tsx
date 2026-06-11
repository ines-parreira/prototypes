import { useOrderActions } from '@repo/customer'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render, userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useCancelOrder } from 'pages/tickets/detail/hooks/useCancelOrder'
import { useDuplicateOrder } from 'pages/tickets/detail/hooks/useDuplicateOrder'
import { useEditOrder } from 'pages/tickets/detail/hooks/useEditOrder'
import { useRefundOrder } from 'pages/tickets/detail/hooks/useRefundOrder'

import { OrderActionsProvider } from '../OrderActionsProvider'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
jest.mock('pages/tickets/detail/hooks/useEditOrder')
jest.mock('pages/tickets/detail/hooks/useDuplicateOrder')
jest.mock('pages/tickets/detail/hooks/useRefundOrder')
jest.mock('pages/tickets/detail/hooks/useCancelOrder')
jest.mock(
    'Widgets/modules/Shopify/modules/Order/modules/EditOrderModal',
    () => ({
        __esModule: true,
        DefaultExportEditOrderModal: () => null,
    }),
)
jest.mock('Widgets/modules/Shopify/modules/DraftOrderModal', () => ({
    __esModule: true,
    DefaultExportDraftOrderModal: () => null,
}))
jest.mock(
    'Widgets/modules/Shopify/modules/Order/modules/RefundOrderModal',
    () => ({
        __esModule: true,
        DefaultExportRefundOrderModal: () => null,
    }),
)
jest.mock(
    'Widgets/modules/Shopify/modules/Order/modules/CancelOrderModal',
    () => ({
        __esModule: true,
        DefaultExportCancelOrderModal: () => null,
    }),
)

const useFlagMock = jest.mocked(useFlag)
const useEditOrderMock = jest.mocked(useEditOrder)
const useDuplicateOrderMock = jest.mocked(useDuplicateOrder)
const useRefundOrderMock = jest.mocked(useRefundOrder)
const useCancelOrderMock = jest.mocked(useCancelOrder)

function makeHook(open = jest.fn()) {
    return {
        open,
        isOpen: false,
        onChange: jest.fn(),
        onBulkChange: jest.fn(),
        onSubmit: jest.fn(),
        onClose: jest.fn(),
        data: null,
    } as any
}

function Consumer() {
    const { onEdit, onDuplicate, onRefund, onCancel } = useOrderActions()
    return (
        <>
            <button onClick={() => onEdit(1, {} as any)}>edit</button>
            <button onClick={() => onDuplicate(1, {} as any)}>duplicate</button>
            <button onClick={() => onRefund(1, {} as any)}>refund</button>
            <button onClick={() => onCancel(1, {} as any)}>cancel</button>
        </>
    )
}

describe('OrderActionsProvider', () => {
    const editOpen = jest.fn()
    const duplicateOpen = jest.fn()
    const refundOpen = jest.fn()
    const cancelOpen = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        useFlagMock.mockReturnValue(false)
        useEditOrderMock.mockReturnValue(makeHook(editOpen))
        useDuplicateOrderMock.mockReturnValue(makeHook(duplicateOpen))
        useRefundOrderMock.mockReturnValue(makeHook(refundOpen))
        useCancelOrderMock.mockReturnValue(makeHook(cancelOpen))
    })

    it('forwards each handler to the corresponding action hook', () => {
        render(
            <OrderActionsProvider>
                <Consumer />
            </OrderActionsProvider>,
        )

        userEvent.click(screen.getByRole('button', { name: 'edit' }))
        userEvent.click(screen.getByRole('button', { name: 'duplicate' }))
        userEvent.click(screen.getByRole('button', { name: 'refund' }))
        userEvent.click(screen.getByRole('button', { name: 'cancel' }))

        expect(editOpen).toHaveBeenCalledWith(1, expect.anything())
        expect(duplicateOpen).toHaveBeenCalledWith(1, expect.anything())
        expect(refundOpen).toHaveBeenCalledWith(1, expect.anything())
        expect(cancelOpen).toHaveBeenCalledWith(1, expect.anything())
    })

    it('replaces all handlers with noops when ShopifyHideActionButtons is enabled', () => {
        useFlagMock.mockImplementation(
            (flag) => flag === FeatureFlagKey.ShopifyHideActionButtons,
        )

        render(
            <OrderActionsProvider>
                <Consumer />
            </OrderActionsProvider>,
        )

        userEvent.click(screen.getByRole('button', { name: 'edit' }))
        userEvent.click(screen.getByRole('button', { name: 'duplicate' }))
        userEvent.click(screen.getByRole('button', { name: 'refund' }))
        userEvent.click(screen.getByRole('button', { name: 'cancel' }))

        expect(editOpen).not.toHaveBeenCalled()
        expect(duplicateOpen).not.toHaveBeenCalled()
        expect(refundOpen).not.toHaveBeenCalled()
        expect(cancelOpen).not.toHaveBeenCalled()
    })
})
