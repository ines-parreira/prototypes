import type { SelectedPlans } from '@repo/billing'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    convertPlan1,
    proMonthlyHelpdeskPlan,
    smsPlan1,
    voicePlan1,
} from 'fixtures/plans'
import { Cadence, ProductType } from 'models/billing/types'

import type { ConfirmChangesModalProps } from '../ConfirmChangesModal'
import { ConfirmChangesModal } from '../ConfirmChangesModal'

jest.mock('../../BillingSummaryBreakdown', () => ({
    BillingSummaryBreakdown: jest.fn(() => null),
}))

const selectedPlans: SelectedPlans = {
    [ProductType.Helpdesk]: {
        plan: basicMonthlyHelpdeskPlan,
        isSelected: true,
    },
    [ProductType.Automation]: { isSelected: false },
    [ProductType.Voice]: { isSelected: false },
    [ProductType.SMS]: { isSelected: false },
    [ProductType.Convert]: { isSelected: false },
}

const plansByProduct: ConfirmChangesModalProps['plansByProduct'] = {
    [ProductType.Helpdesk]: {
        current: basicMonthlyHelpdeskPlan,
        available: [basicMonthlyHelpdeskPlan, proMonthlyHelpdeskPlan],
    },
    [ProductType.Automation]: {
        available: [basicMonthlyAutomationPlan],
    },
    [ProductType.Voice]: { available: [voicePlan1] },
    [ProductType.SMS]: { available: [smsPlan1] },
    [ProductType.Convert]: { available: [convertPlan1] },
}

const defaultProps: ConfirmChangesModalProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    isConfirming: false,
    selectedPlans,
    cadence: Cadence.Month,
    periodEnd: '2026-12-31',
    plansByProduct,
    totalProductAmount: basicMonthlyHelpdeskPlan.amount,
    totalCancelledAmount: 0,
    cancelledProducts: [],
    currency: 'USD',
    cancellationDates: {},
}

function renderModal(overrides: Partial<ConfirmChangesModalProps> = {}) {
    return render(<ConfirmChangesModal {...defaultProps} {...overrides} />)
}

describe('ConfirmChangesModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the modal with title and buttons', () => {
        renderModal()

        expect(
            screen.getByRole('dialog', { name: /confirm changes/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /go back/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /confirm/i }),
        ).toBeInTheDocument()
    })

    describe('description text', () => {
        it('shows upgrade-only description when plan is upgraded', () => {
            const upgradePlans: SelectedPlans = {
                ...selectedPlans,
                [ProductType.Helpdesk]: {
                    plan: proMonthlyHelpdeskPlan,
                    isSelected: true,
                },
            }
            const upgradeByProduct: ConfirmChangesModalProps['plansByProduct'] =
                {
                    ...plansByProduct,
                    [ProductType.Helpdesk]: {
                        current: basicMonthlyHelpdeskPlan,
                        available: [
                            basicMonthlyHelpdeskPlan,
                            proMonthlyHelpdeskPlan,
                        ],
                    },
                }
            renderModal({
                selectedPlans: upgradePlans,
                plansByProduct: upgradeByProduct,
            })

            expect(
                screen.getByText(
                    'Once you confirm, your changes will take effect immediately.',
                ),
            ).toBeInTheDocument()
        })

        it('shows downgrade-only description when plan is downgraded', () => {
            const downgradePlans: SelectedPlans = {
                ...selectedPlans,
                [ProductType.Helpdesk]: {
                    plan: basicMonthlyHelpdeskPlan,
                    isSelected: true,
                },
            }
            const downgradeByProduct: ConfirmChangesModalProps['plansByProduct'] =
                {
                    ...plansByProduct,
                    [ProductType.Helpdesk]: {
                        current: proMonthlyHelpdeskPlan,
                        available: [
                            basicMonthlyHelpdeskPlan,
                            proMonthlyHelpdeskPlan,
                        ],
                    },
                }
            renderModal({
                selectedPlans: downgradePlans,
                plansByProduct: downgradeByProduct,
            })

            expect(
                screen.getByText(
                    /your changes will take effect at the end of your billing cycle on 2026-12-31/,
                ),
            ).toBeInTheDocument()
        })

        it('shows mixed description when both upgrades and downgrades exist', () => {
            const mixedPlans: SelectedPlans = {
                ...selectedPlans,
                [ProductType.Helpdesk]: {
                    plan: proMonthlyHelpdeskPlan,
                    isSelected: true,
                },
                [ProductType.Automation]: {
                    plan: basicMonthlyAutomationPlan,
                    isSelected: true,
                },
            }
            const mixedByProduct: ConfirmChangesModalProps['plansByProduct'] = {
                ...plansByProduct,
                [ProductType.Helpdesk]: {
                    current: basicMonthlyHelpdeskPlan,
                    available: [
                        basicMonthlyHelpdeskPlan,
                        proMonthlyHelpdeskPlan,
                    ],
                },
                [ProductType.Automation]: {
                    current: basicMonthlyAutomationPlan,
                    available: [basicMonthlyAutomationPlan],
                },
            }
            renderModal({
                selectedPlans: mixedPlans,
                plansByProduct: mixedByProduct,
                cancelledProducts: [ProductType.Voice],
            })

            expect(
                screen.getByText(
                    /upgraded and added products will take effect immediately.*downgraded products will take effect at the end of your billing cycle on 2026-12-31/,
                ),
            ).toBeInTheDocument()
        })
    })

    describe('button interactions', () => {
        it('calls onConfirm when Confirm button is clicked', async () => {
            const user = userEvent.setup()
            const onConfirm = jest.fn()
            renderModal({ onConfirm })

            await act(() =>
                user.click(screen.getByRole('button', { name: /confirm/i })),
            )

            expect(onConfirm).toHaveBeenCalledTimes(1)
        })

        it('calls onClose when Go back button is clicked', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()
            renderModal({ onClose })

            await act(() =>
                user.click(screen.getByRole('button', { name: /go back/i })),
            )

            expect(onClose).toHaveBeenCalledTimes(1)
        })
    })

    it('calls onClose when dismissed via Escape while not confirming', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()
        renderModal({ onClose })

        await act(() => user.keyboard('{Escape}'))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    describe('while confirming', () => {
        it('disables Go back button', () => {
            renderModal({ isConfirming: true })

            expect(
                screen.getByRole('button', { name: /go back/i }),
            ).toBeDisabled()
        })

        it('does not call onClose on overlay dismiss via Escape', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()
            renderModal({ isConfirming: true, onClose })

            await act(() => user.keyboard('{Escape}'))

            expect(onClose).not.toHaveBeenCalled()
        })
    })

    it('does not render when isOpen is false', () => {
        renderModal({ isOpen: false })

        expect(
            screen.queryByRole('dialog', { name: /confirm changes/i }),
        ).not.toBeInTheDocument()
    })
})
