import type { OrderData, ShopperData } from '@repo/customer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'

import { useCancelOrder } from 'pages/tickets/detail/hooks/useCancelOrder'
import { useDuplicateOrder } from 'pages/tickets/detail/hooks/useDuplicateOrder'
import { useRefundOrder } from 'pages/tickets/detail/hooks/useRefundOrder'

import { OrderSidePanelWithActions } from '../OrderSidePanelWithActions'

let capturedOnDuplicate: ((order: any) => void) | undefined
let capturedOnRefund: ((order: any) => void) | undefined
let capturedOnCancel: ((order: any) => void) | undefined

jest.mock('@repo/customer', () => ({
    OrderSidePanelPreview: ({
        onDuplicate,
        onRefund,
        onCancel,
    }: {
        onDuplicate: (order: any) => void
        onRefund: (order: any) => void
        onCancel: (order: any) => void
    }) => {
        capturedOnDuplicate = onDuplicate
        capturedOnRefund = onRefund
        capturedOnCancel = onCancel
        return <div>OrderSidePanelPreview</div>
    },
}))

jest.mock('pages/tickets/detail/hooks/useDuplicateOrder', () => ({
    useDuplicateOrder: jest.fn(),
}))

jest.mock('pages/tickets/detail/hooks/useRefundOrder', () => ({
    useRefundOrder: jest.fn(),
}))

jest.mock('pages/tickets/detail/hooks/useCancelOrder', () => ({
    useCancelOrder: jest.fn(),
}))

jest.mock('Widgets/modules/Shopify/modules/DraftOrderModal', () => ({
    __esModule: true,
    default: () => null,
}))

jest.mock(
    'Widgets/modules/Shopify/modules/Order/modules/RefundOrderModal',
    () => ({
        __esModule: true,
        default: () => null,
    }),
)

jest.mock(
    'Widgets/modules/Shopify/modules/Order/modules/CancelOrderModal',
    () => ({
        __esModule: true,
        default: () => null,
    }),
)

const mockHookReturn = () => ({
    isOpen: false,
    data: null,
    open: jest.fn(),
    onChange: jest.fn(),
    onBulkChange: jest.fn(),
    onSubmit: jest.fn(),
    onClose: jest.fn(),
})

function renderComponent(integrationId?: number) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    const duplicateOpen = jest.fn()
    const refundOpen = jest.fn()
    const cancelOpen = jest.fn()

    jest.mocked(useDuplicateOrder).mockReturnValue({
        ...mockHookReturn(),
        open: duplicateOpen,
    })
    jest.mocked(useRefundOrder).mockReturnValue({
        ...mockHookReturn(),
        open: refundOpen,
    })
    jest.mocked(useCancelOrder).mockReturnValue({
        ...mockHookReturn(),
        open: cancelOpen,
    })

    render(
        <QueryClientProvider client={queryClient}>
            <OrderSidePanelWithActions
                order={null}
                isOpen={false}
                onOpenChange={jest.fn()}
                integrationId={integrationId}
            />
        </QueryClientProvider>,
    )

    return { duplicateOpen, refundOpen, cancelOpen }
}

const testOrder = { id: 1, name: '#1001' } as unknown as OrderData
const testOrderWithCustomer = {
    ...testOrder,
    customer: { id: 99 } as ShopperData,
} as unknown as OrderData & { customer: ShopperData }

describe('OrderSidePanelWithActions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        capturedOnDuplicate = undefined
        capturedOnRefund = undefined
        capturedOnCancel = undefined
    })

    describe('handleDuplicate', () => {
        it('calls duplicateOrder.open when integrationId and customer are present', () => {
            const { duplicateOpen } = renderComponent(42)
            capturedOnDuplicate!(testOrderWithCustomer)
            expect(duplicateOpen).toHaveBeenCalledWith(
                42,
                testOrderWithCustomer,
            )
        })

        it('does not call duplicateOrder.open when integrationId is absent', () => {
            const { duplicateOpen } = renderComponent(undefined)
            capturedOnDuplicate!(testOrderWithCustomer)
            expect(duplicateOpen).not.toHaveBeenCalled()
        })

        it('does not call duplicateOrder.open when order has no customer', () => {
            const { duplicateOpen } = renderComponent(42)
            capturedOnDuplicate!(testOrder)
            expect(duplicateOpen).not.toHaveBeenCalled()
        })
    })

    describe('handleRefund', () => {
        it('calls refundOrder.open when integrationId is present', () => {
            const { refundOpen } = renderComponent(42)
            capturedOnRefund!(testOrder)
            expect(refundOpen).toHaveBeenCalledWith(42, testOrder)
        })

        it('does not call refundOrder.open when integrationId is absent', () => {
            const { refundOpen } = renderComponent(undefined)
            capturedOnRefund!(testOrder)
            expect(refundOpen).not.toHaveBeenCalled()
        })
    })

    describe('handleCancel', () => {
        it('calls cancelOrder.open when integrationId is present', () => {
            const { cancelOpen } = renderComponent(42)
            capturedOnCancel!(testOrder)
            expect(cancelOpen).toHaveBeenCalledWith(42, testOrder)
        })

        it('does not call cancelOrder.open when integrationId is absent', () => {
            const { cancelOpen } = renderComponent(undefined)
            capturedOnCancel!(testOrder)
            expect(cancelOpen).not.toHaveBeenCalled()
        })
    })
})
