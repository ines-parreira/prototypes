import React from 'react'

import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '@testing-library/jest-dom/extend-expect'

import { Cadence } from 'models/billing/types'

import { EarlyAccessModal } from '../EarlyAccessModal'

describe('<EarlyAccessModal />', () => {
    const acceptTermsAndConditions = () => {
        const checkbox = screen.getByRole('checkbox')
        fireEvent.click(checkbox)
    }

    it('should render the modal and handler should be called when clicked', () => {
        const onCloseMock = jest.fn()
        const onUpgradeClickMock = jest.fn()

        const { getByText } = render(
            <EarlyAccessModal
                isOpen
                isLoading={false}
                onClose={onCloseMock}
                onUpgradeClick={onUpgradeClickMock}
                userIsAdmin={true}
                isUpgrading={false}
            />,
        )

        const upgradeButton = getByText('Upgrade AI Agent', { exact: true })
        expect(upgradeButton).toBeInTheDocument()
        userEvent.click(upgradeButton)
    })

    it('should render the modal in loading state without crashing', () => {
        render(
            <EarlyAccessModal
                isOpen
                isLoading={true}
                onClose={() => {}}
                onUpgradeClick={() => {}}
                userIsAdmin={true}
                isUpgrading={false}
            />,
        )
    })

    it('should render good pricing values', () => {
        render(
            <EarlyAccessModal
                isOpen
                isLoading={false}
                onClose={() => {}}
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

        const overageElement = screen.getByText('Overage:', {
            selector: 'span',
        })
        expect(
            within(overageElement.parentElement as HTMLElement).getByText(
                '$1.50',
            ),
        ).toBeInTheDocument()
    })

    it('should display discount information when available', () => {
        const { getByText } = render(
            <EarlyAccessModal
                isOpen
                isLoading={false}
                onClose={() => {}}
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
            />,
        )

        expect(getByText('450 automated tickets/months')).toBeInTheDocument()
    })

    it('should disable upgrade button when terms are not accepted', () => {
        const { queryByText } = render(
            <EarlyAccessModal
                isOpen
                isLoading={true}
                onClose={() => {}}
                onUpgradeClick={() => {}}
                userIsAdmin={true}
                isUpgrading={false}
            />,
        )

        const upgradeCta = queryByText('Upgrade AI Agent')?.parentElement

        expect(upgradeCta).toBeAriaDisabled()
    })

    it('should enable upgrade button when terms are accepted', () => {
        const { queryByText } = render(
            <EarlyAccessModal
                isOpen
                isLoading={true}
                onClose={() => {}}
                onUpgradeClick={() => {}}
                userIsAdmin={true}
                isUpgrading={false}
            />,
        )

        acceptTermsAndConditions()

        const upgradeCta = queryByText('Upgrade AI Agent')?.parentElement

        expect(upgradeCta).toBeAriaEnabled()
    })

    it.each([
        {
            userIsAdmin: true,
            testName:
                'should render the modal with enabled CTAs if user is admin',
        },
        {
            userIsAdmin: false,
            testName:
                'should render the modal with warning and disabled CTAs if user is not admin',
        },
    ])('$testName', ({ userIsAdmin }) => {
        const { queryByRole, queryByText } = render(
            <EarlyAccessModal
                isOpen
                isLoading={true}
                onClose={() => {}}
                onUpgradeClick={() => {}}
                userIsAdmin={userIsAdmin}
                isUpgrading={false}
            />,
        )

        const upgradeCta = queryByText('Upgrade AI Agent')?.parentElement
        const termsCheckbox = queryByRole('checkbox')

        const warningBanner = queryByText(
            'You do not have admin access. Contact your admin to upgrade.',
        )

        acceptTermsAndConditions()

        if (userIsAdmin) {
            expect(termsCheckbox).toBeEnabled()
            expect(upgradeCta).toBeAriaEnabled()
            expect(warningBanner).not.toBeInTheDocument()
        } else {
            expect(termsCheckbox).toBeDisabled()
            expect(upgradeCta).toBeAriaDisabled()
            expect(warningBanner).toBeInTheDocument()
        }
    })
})
