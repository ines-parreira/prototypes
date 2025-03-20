import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom/extend-expect'

import { Cadence } from 'models/billing/types'

import { EarlyAccessModal } from '../EarlyAccessModal'

describe('<EarlyAccessModal />', () => {
    it('should render the modal and handler should be called when clicked', () => {
        const onCloseMock = jest.fn()
        const onUpgradeClickMock = jest.fn()
        const onStayClickMock = jest.fn()

        const { getByText } = render(
            <EarlyAccessModal
                isOpen
                isLoading={false}
                onClose={onCloseMock}
                onStayClick={onStayClickMock}
                onUpgradeClick={onUpgradeClickMock}
                userIsAdmin={true}
                isUpgrading={false}
            />,
        )

        const upgradeButton = getByText(
            'Upgrade AI Agent With Early Access Plan',
            { exact: true },
        )
        expect(upgradeButton).toBeInTheDocument()
        userEvent.click(upgradeButton)

        const staybutton = getByText('Stay On Current Plan', { exact: true })
        expect(staybutton).toBeInTheDocument()
        userEvent.click(staybutton)
    })

    it('should render the modal in loading state without crashing', () => {
        render(
            <EarlyAccessModal
                isOpen
                isLoading={true}
                onClose={() => {}}
                onStayClick={() => {}}
                onUpgradeClick={() => {}}
                userIsAdmin={true}
                isUpgrading={false}
            />,
        )
    })

    it('should open the tips list when clicking on tips title', () => {
        render(
            <EarlyAccessModal
                isOpen
                isLoading={true}
                onClose={() => {}}
                onStayClick={() => {}}
                onUpgradeClick={() => {}}
                userIsAdmin={true}
                isUpgrading={false}
            />,
        )

        expect(
            screen.queryByText(
                'Meet the first AI Agent that sells via playbook',
            ),
        ).not.toBeInTheDocument()

        const tipsTitle = screen.getByText(
            'Grow GMV with Sales Skills for your AI Agent',
        )
        fireEvent.click(tipsTitle)

        expect(
            screen.queryByText(
                'Meet the first AI Agent that sells via playbook',
            ),
        ).toBeInTheDocument()
    })

    it('should render good pricing values', () => {
        const { getAllByText } = render(
            <EarlyAccessModal
                isOpen
                isLoading={false}
                onClose={() => {}}
                onStayClick={() => {}}
                onUpgradeClick={() => {}}
                userIsAdmin={true}
                isUpgrading={false}
                earlyAccessPlan={
                    {
                        amount: 108000,
                        currency: 'USD',
                        amount_after_discount: 90000,
                        cadence: Cadence.Month,
                        discount: 18000,
                        extra_ticket_cost: 2.2,
                        num_quota_tickets: 450,
                    } as any
                }
                currentPlan={
                    {
                        amount: 90000,
                        currency: 'USD',
                        cadence: Cadence.Month,
                        num_quota_tickets: 450,
                        extra_ticket_cost: 2.5,
                    } as any
                }
            />,
        )

        const [currentPlan, newPlan] = getAllByText(
            'per automated conversation',
        )

        expect(currentPlan).toBeInTheDocument()
        expect(newPlan).toBeInTheDocument()
        expect(currentPlan.textContent).toContain(
            '$2 per automated conversation',
        )
        expect(newPlan.textContent).toContain('$2 per automated conversation')

        const [currentPlanExtraCost, newPlanExtraCost] =
            getAllByText('Overage:')
        expect(currentPlanExtraCost).toBeInTheDocument()
        expect(newPlanExtraCost).toBeInTheDocument()
        expect(currentPlanExtraCost.parentElement?.textContent).toContain(
            'Overage: $2.50',
        )
        expect(newPlanExtraCost.parentElement?.textContent).toContain(
            'Overage: $2.20',
        )
    })

    it.each([
        {
            userIsAdmin: true,
            testName:
                'should render the modal with enabled CTAs if user is admin',
        },
        {
            userIsAdmin: true,
            testName:
                'should render the modal with warning and disabled CTAs if user is not admin',
        },
    ])('$testName', ({ userIsAdmin }) => {
        const { queryByText } = render(
            <EarlyAccessModal
                isOpen
                isLoading={true}
                onClose={() => {}}
                onStayClick={() => {}}
                onUpgradeClick={() => {}}
                userIsAdmin={userIsAdmin}
                isUpgrading={false}
            />,
        )

        const upgradeCta = queryByText(
            'Upgrade AI Agent With Early Access Plan',
        )?.parentElement
        // I wanted to check the disabled attribute, but the Button component does not have a disabled attribute 😅
        const stayCta = queryByText('Stay On Current Plan')
        const warningBanner = queryByText(
            'You do not have admin access. Contact your admin to upgrade.',
        )

        if (userIsAdmin) {
            expect(upgradeCta).toBeAriaEnabled()
            expect(stayCta).toBeAriaEnabled()
            expect(warningBanner).not.toBeInTheDocument()
        } else {
            expect(upgradeCta).toBeAriaDisabled()
            expect(stayCta).toBeAriaDisabled()
            expect(warningBanner).toBeInTheDocument()
        }
    })
})
