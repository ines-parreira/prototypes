import { useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import type { HelpdeskPlan } from 'models/billing/types'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'
import { isTrialing as getIsTrialing } from 'state/currentAccount/selectors'
import { getCompanyFixedGmvBandTier } from 'state/currentCompany/selectors'
import { CompanyTier } from 'state/currentCompany/types'
import { getCurrentUser } from 'state/currentUser/selectors'

import OfficeHours from '../OfficeHours'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

jest.mock(
    '@repo/logging',
    () =>
        ({
            ...jest.requireActual('@repo/logging'),
            logEvent: jest.fn(),
        }) as typeof import('@repo/logging'),
)

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('state/billing/selectors', () => ({
    getCurrentHelpdeskPlan: jest.fn(),
}))
const getCurrentHelpdeskPlanMock = assumeMock(getCurrentHelpdeskPlan)

jest.mock('state/currentAccount/selectors', () => ({
    isTrialing: jest.fn(),
}))
const getIsTrialingMock = assumeMock(getIsTrialing)

jest.mock('state/currentCompany/selectors', () => ({
    getCompanyFixedGmvBandTier: jest.fn(),
}))
const getFixedGmvBandTierMock = assumeMock(getCompanyFixedGmvBandTier)

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUser: jest.fn(),
}))

const getCurrentUserMock = assumeMock(getCurrentUser)

describe('OfficeHours', () => {
    let onToggle: jest.Mock

    beforeEach(() => {
        getCurrentHelpdeskPlanMock.mockReturnValue({
            name: 'Pro',
        } as HelpdeskPlan)
        getIsTrialingMock.mockReturnValue(false)
        getFixedGmvBandTierMock.mockReturnValue(null)
        useFlagMock.mockReturnValue(true)
        getCurrentUserMock.mockReturnValue(
            fromJS({
                email: 'test@example.com',
                role: {
                    name: 'admin',
                },
            }),
        )

        onToggle = jest.fn()
    })

    it('should not render if not on the pro plan', () => {
        getCurrentHelpdeskPlanMock.mockReturnValue({
            name: 'Basic',
        } as HelpdeskPlan)
        const { container } = render(
            <OfficeHours onToggleDropdown={onToggle} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('should not render while on trial', () => {
        getIsTrialingMock.mockReturnValue(true)
        const { container } = render(
            <OfficeHours onToggleDropdown={onToggle} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('should not render if the feature flag is not active', () => {
        useFlagMock.mockReturnValue(false)
        const { container } = render(
            <OfficeHours onToggleDropdown={onToggle} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('should render a link to be able to book office hours', () => {
        const { getByText } = render(
            <OfficeHours onToggleDropdown={onToggle} />,
        )
        const el = getByText('Book office hours')
        expect(el.getAttribute('href')).toBe(
            'https://calendly.com/gorgias-office-hours?utm_source=helpdesk&utm_medium=in_product&utm_campaign=user_menu',
        )
        expect(el.getAttribute('rel')).toBe('noreferrer')
        expect(el.getAttribute('target')).toBe('_blank')
        expect(el.getAttribute('title')).toBe(
            'Book a meeting with a Customer Success Manager at Gorgias.',
        )

        userEvent.click(el)
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            {
                link: 'office-hours',
                user_email: 'test@example.com',
                user_role: 'admin',
            },
        )
        expect(onToggle).toHaveBeenCalledWith()
    })

    describe('GMV Band tier logic', () => {
        describe('eligible tiers should render `Book office hours` button', () => {
            const eligibleTiers = [
                { tier: CompanyTier.Tier2, description: 'SMB 2' },
                { tier: CompanyTier.Tier3, description: 'Commercial 1' },
                { tier: CompanyTier.Tier4, description: 'Commercial 2' },
                { tier: CompanyTier.Band1, description: 'SMB' },
                { tier: CompanyTier.Band2, description: 'Commercial' },
            ]

            it.each(eligibleTiers)(
                'should render for $tier ($description)',
                ({ tier }) => {
                    getFixedGmvBandTierMock.mockReturnValue(tier)
                    getCurrentHelpdeskPlanMock.mockReturnValue({
                        name: 'Basic',
                    } as HelpdeskPlan)

                    const { getByText } = render(
                        <OfficeHours onToggleDropdown={onToggle} />,
                    )
                    expect(getByText('Book office hours')).toBeInTheDocument()
                },
            )
        })

        describe('ineligible tiers should not render `Book office hours` button', () => {
            const ineligibleTiers = [
                { tier: CompanyTier.Tier1, description: 'SMB 1' },
                { tier: CompanyTier.Tier5, description: 'Enterprise 1' },
                { tier: CompanyTier.Tier6, description: 'Enterprise 2' },
                { tier: CompanyTier.Band3, description: 'Enterprise' },
                { tier: CompanyTier.Band4, description: 'Named Accounts' },
            ]

            it.each(ineligibleTiers)(
                'should not render for $tier ($description)',
                ({ tier }) => {
                    getFixedGmvBandTierMock.mockReturnValue(tier)
                    getCurrentHelpdeskPlanMock.mockReturnValue({
                        name: 'Basic',
                    } as HelpdeskPlan)

                    const { container } = render(
                        <OfficeHours onToggleDropdown={onToggle} />,
                    )
                    expect(container).toBeEmptyDOMElement()
                },
            )
        })

        describe('fallback to Pro plan check when GMV band tier is null', () => {
            it('should render with null GMV band tier and Pro plan', () => {
                getFixedGmvBandTierMock.mockReturnValue(null)
                getCurrentHelpdeskPlanMock.mockReturnValue({
                    name: 'Pro',
                } as HelpdeskPlan)

                const { getByText } = render(
                    <OfficeHours onToggleDropdown={onToggle} />,
                )
                expect(getByText('Book office hours')).toBeInTheDocument()
            })

            it('should not render with null GMV band tier and non-Pro plan', () => {
                getFixedGmvBandTierMock.mockReturnValue(null)
                getCurrentHelpdeskPlanMock.mockReturnValue({
                    name: 'Basic',
                } as HelpdeskPlan)

                const { container } = render(
                    <OfficeHours onToggleDropdown={onToggle} />,
                )
                expect(container).toBeEmptyDOMElement()
            })
        })
    })
})
