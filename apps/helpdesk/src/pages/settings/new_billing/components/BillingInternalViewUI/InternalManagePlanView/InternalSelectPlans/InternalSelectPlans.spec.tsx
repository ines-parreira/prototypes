import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { InvoiceCadence } from '@gorgias/helpdesk-types'

import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
} from 'fixtures/plans'
import type {
    CurrentPlans,
    InternalProductCatalogPlans,
    PlanId,
} from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'
import type { ResolvedPlan } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/useInternalPlanEditor'

import type { InternalSelectPlansProps } from './InternalSelectPlans'
import { InternalSelectPlans } from './InternalSelectPlans'

const helpdeskCatalog: Record<PlanId, typeof basicMonthlyHelpdeskPlan> = {
    [basicMonthlyHelpdeskPlan.plan_id]: basicMonthlyHelpdeskPlan,
    [proMonthlyHelpdeskPlan.plan_id]: proMonthlyHelpdeskPlan,
}

const defaultCurrentPlans: CurrentPlans = {
    helpdesk: basicMonthlyHelpdeskPlan,
    automate: null,
    voice: null,
    sms: null,
    convert: null,
}

const defaultCatalogPlans: InternalProductCatalogPlans = {
    [ProductType.Helpdesk]: helpdeskCatalog,
}

const helpdeskResolvedPlan: ResolvedPlan = {
    productType: ProductType.Helpdesk,
    plan: basicMonthlyHelpdeskPlan,
    currentPlan: basicMonthlyHelpdeskPlan,
    status: 'unchanged',
    action: null,
}

const defaultProps: InternalSelectPlansProps = {
    currentPlans: defaultCurrentPlans,
    catalogPlans: defaultCatalogPlans,
    targetPlans: {},
    resolvedPlans: [helpdeskResolvedPlan],
    contractCadence: Cadence.Month,
    invoiceCadence: InvoiceCadence.Month,
    onPlanSelect: jest.fn(),
    onContractCadenceChange: jest.fn(),
    onInvoiceCadenceChange: jest.fn(),
}

function renderComponent(overrides: Partial<typeof defaultProps> = {}) {
    return render(<InternalSelectPlans {...defaultProps} {...overrides} />)
}

describe('InternalSelectPlans', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Billing Frequency section', () => {
        it('renders the Billing Frequency heading', () => {
            renderComponent()

            expect(screen.getByText('Billing Frequency')).toBeInTheDocument()
        })

        it('renders the Contract cadence label', () => {
            renderComponent()

            expect(screen.getByText('Contract cadence')).toBeInTheDocument()
        })

        it('renders Monthly and Yearly contract cadence buttons', () => {
            renderComponent()

            const contractGroup = screen.getByRole('radiogroup', {
                name: 'Contract cadence',
            })
            expect(
                within(contractGroup).getByRole('button', { name: 'Monthly' }),
            ).toBeInTheDocument()
            expect(
                within(contractGroup).getByRole('button', { name: 'Yearly' }),
            ).toBeInTheDocument()
        })

        it('calls onContractCadenceChange with Yearly when Yearly is clicked', async () => {
            const user = userEvent.setup()
            const onContractCadenceChange = jest.fn()
            renderComponent({ onContractCadenceChange })

            const contractGroup = screen.getByRole('radiogroup', {
                name: 'Contract cadence',
            })
            await user.click(
                within(contractGroup).getByRole('button', {
                    name: 'Yearly',
                }),
            )

            expect(onContractCadenceChange).toHaveBeenCalledWith(Cadence.Year)
        })

        it('calls onContractCadenceChange with Monthly when Monthly is clicked', async () => {
            const user = userEvent.setup()
            const onContractCadenceChange = jest.fn()
            renderComponent({
                contractCadence: Cadence.Year,
                onContractCadenceChange,
            })

            const contractGroup = screen.getByRole('radiogroup', {
                name: 'Contract cadence',
            })
            await user.click(
                within(contractGroup).getByRole('button', {
                    name: 'Monthly',
                }),
            )

            expect(onContractCadenceChange).toHaveBeenCalledWith(Cadence.Month)
        })
    })

    describe('Invoice cadence section', () => {
        it('does not render the invoice cadence section when contract cadence is Monthly', () => {
            renderComponent({ contractCadence: Cadence.Month })

            expect(
                screen.queryByText('Invoice cadence'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('radiogroup', { name: 'Invoice cadence' }),
            ).not.toBeInTheDocument()
        })

        it('renders the invoice cadence section when contract cadence is Yearly', () => {
            renderComponent({ contractCadence: Cadence.Year })

            expect(screen.getByText('Invoice cadence')).toBeInTheDocument()
            expect(
                screen.getByRole('radiogroup', { name: 'Invoice cadence' }),
            ).toBeInTheDocument()
        })

        it('renders all four invoice cadence buttons when contract cadence is Yearly', () => {
            renderComponent({
                contractCadence: Cadence.Year,
                invoiceCadence: InvoiceCadence.Year,
            })

            const invoiceGroup = screen.getByRole('radiogroup', {
                name: 'Invoice cadence',
            })
            expect(
                within(invoiceGroup).getByRole('button', { name: 'Monthly' }),
            ).toBeInTheDocument()
            expect(
                within(invoiceGroup).getByRole('button', {
                    name: 'Quarterly',
                }),
            ).toBeInTheDocument()
            expect(
                within(invoiceGroup).getByRole('button', {
                    name: 'Biannually',
                }),
            ).toBeInTheDocument()
            expect(
                within(invoiceGroup).getByRole('button', { name: 'Yearly' }),
            ).toBeInTheDocument()
        })

        it('calls onInvoiceCadenceChange with Monthly when Monthly invoice option is clicked', async () => {
            const user = userEvent.setup()
            const onInvoiceCadenceChange = jest.fn()
            renderComponent({
                contractCadence: Cadence.Year,
                invoiceCadence: InvoiceCadence.Quarter,
                onInvoiceCadenceChange,
            })

            const invoiceGroup = screen.getByRole('radiogroup', {
                name: 'Invoice cadence',
            })
            await user.click(
                within(invoiceGroup).getByRole('button', {
                    name: 'Monthly',
                }),
            )

            expect(onInvoiceCadenceChange).toHaveBeenCalledWith(
                InvoiceCadence.Month,
            )
        })

        it('calls onInvoiceCadenceChange with Quarterly when Quarterly is clicked', async () => {
            const user = userEvent.setup()
            const onInvoiceCadenceChange = jest.fn()
            renderComponent({
                contractCadence: Cadence.Year,
                invoiceCadence: InvoiceCadence.Month,
                onInvoiceCadenceChange,
            })

            const invoiceGroup = screen.getByRole('radiogroup', {
                name: 'Invoice cadence',
            })
            await user.click(
                within(invoiceGroup).getByRole('button', {
                    name: 'Quarterly',
                }),
            )

            expect(onInvoiceCadenceChange).toHaveBeenCalledWith(
                InvoiceCadence.Quarter,
            )
        })

        it('calls onInvoiceCadenceChange with Biannual when Biannually is clicked', async () => {
            const user = userEvent.setup()
            const onInvoiceCadenceChange = jest.fn()
            renderComponent({
                contractCadence: Cadence.Year,
                invoiceCadence: InvoiceCadence.Month,
                onInvoiceCadenceChange,
            })

            const invoiceGroup = screen.getByRole('radiogroup', {
                name: 'Invoice cadence',
            })
            await user.click(
                within(invoiceGroup).getByRole('button', {
                    name: 'Biannually',
                }),
            )

            expect(onInvoiceCadenceChange).toHaveBeenCalledWith(
                InvoiceCadence.Biannual,
            )
        })
    })

    describe('Select Plans section', () => {
        it('renders the Select Plans heading', () => {
            renderComponent()

            expect(screen.getByText('Select Plans')).toBeInTheDocument()
        })

        it('renders the See Plans Details link', () => {
            renderComponent()

            expect(
                screen.getByRole('link', { name: /See Plans Details/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Product rows', () => {
        it('renders a product row for each resolved plan', () => {
            const automationResolvedPlan: ResolvedPlan = {
                productType: ProductType.Automation,
                plan: basicMonthlyAutomationPlan,
                currentPlan: basicMonthlyAutomationPlan,
                status: 'unchanged',
                action: null,
            }

            renderComponent({
                currentPlans: {
                    ...defaultCurrentPlans,
                    automate: basicMonthlyAutomationPlan,
                },
                resolvedPlans: [helpdeskResolvedPlan, automationResolvedPlan],
            })

            expect(screen.getByText('Helpdesk')).toBeInTheDocument()
            expect(screen.getByText('AI Agent')).toBeInTheDocument()
        })

        it('renders a product row for a removed plan as inactive (no plan select)', () => {
            const removedResolvedPlan: ResolvedPlan = {
                productType: ProductType.Automation,
                plan: null,
                currentPlan: basicMonthlyAutomationPlan,
                status: 'removed',
                action: null,
            }

            renderComponent({
                resolvedPlans: [helpdeskResolvedPlan, removedResolvedPlan],
            })

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(
                screen.queryByLabelText('AI Agent plan'),
            ).not.toBeInTheDocument()
        })

        it('renders an added product row as active even with no current plan', () => {
            const addedResolvedPlan: ResolvedPlan = {
                productType: ProductType.Automation,
                plan: basicMonthlyAutomationPlan,
                currentPlan: null,
                status: 'added',
                action: null,
            }

            renderComponent({
                catalogPlans: {
                    ...defaultCatalogPlans,
                    [ProductType.Automation]: {
                        [basicMonthlyAutomationPlan.plan_id]:
                            basicMonthlyAutomationPlan,
                    },
                },
                resolvedPlans: [helpdeskResolvedPlan, addedResolvedPlan],
            })

            expect(screen.getByLabelText('AI Agent plan')).toBeInTheDocument()
        })

        it('renders action button and calls onAction when clicked', async () => {
            const user = userEvent.setup()
            const onAction = jest.fn()
            const resolvedPlanWithAction: ResolvedPlan = {
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
                status: 'unchanged',
                action: { kind: 'remove', label: 'Remove', onAction },
            }

            renderComponent({ resolvedPlans: [resolvedPlanWithAction] })

            await user.click(screen.getByRole('button', { name: 'Remove' }))

            expect(onAction).toHaveBeenCalledTimes(1)
        })

        it('renders a dashed separator between multiple product rows', () => {
            const automationResolvedPlan: ResolvedPlan = {
                productType: ProductType.Automation,
                plan: basicMonthlyAutomationPlan,
                currentPlan: basicMonthlyAutomationPlan,
                status: 'unchanged',
                action: null,
            }

            const { container } = renderComponent({
                currentPlans: {
                    ...defaultCurrentPlans,
                    automate: basicMonthlyAutomationPlan,
                },
                resolvedPlans: [helpdeskResolvedPlan, automationResolvedPlan],
            })

            const dashedSeparators = container.querySelectorAll(
                '[data-variant="dashed"]',
            )
            expect(dashedSeparators).toHaveLength(1)
        })

        it('renders no dashed separator for a single product row', () => {
            const { container } = renderComponent({
                resolvedPlans: [helpdeskResolvedPlan],
            })

            const dashedSeparators = container.querySelectorAll(
                '[data-variant="dashed"]',
            )
            expect(dashedSeparators).toHaveLength(0)
        })
    })
})
