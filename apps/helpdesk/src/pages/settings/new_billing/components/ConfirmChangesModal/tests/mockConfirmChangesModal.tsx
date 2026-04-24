import type { ComponentProps } from 'react'

import type { ConfirmChangesModal } from '../ConfirmChangesModal'

type Props = ComponentProps<typeof ConfirmChangesModal>

export function mockConfirmChangesModalComponent() {
    return jest.fn(
        ({
            isOpen,
            onClose,
            onConfirm,
            pendingInvoiceError,
            versionConflictError,
            isPaymentMethodMissing,
        }: Props) => (
            <div>
                <span>
                    {isOpen ? 'confirm modal open' : 'confirm modal closed'}
                </span>
                {pendingInvoiceError && <span>pending invoice error</span>}
                {versionConflictError && <span>version conflict error</span>}
                {isPaymentMethodMissing && <span>payment method missing</span>}
                {isOpen && (
                    <>
                        <button onClick={onConfirm} type="button">
                            confirm changes
                        </button>
                        <button onClick={onClose} type="button">
                            close modal
                        </button>
                    </>
                )}
            </div>
        ),
    )
}
