import React from 'react'

import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import { useFlag } from 'core/flags'
import type { HelpdeskPlan } from 'models/billing/types'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'
import { isTrialing as getIsTrialing } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { assumeMock } from 'utils/testing'

import OfficeHours from '../OfficeHours'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

jest.mock(
    'common/segment',
    () =>
        ({
            ...jest.requireActual('common/segment'),
            logEvent: jest.fn(),
        }) as typeof import('common/segment'),
)

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('state/billing/selectors', () => ({
    getCurrentHelpdeskPlan: jest.fn(),
}))
const getCurrentHelpdeskPlanMock = assumeMock(getCurrentHelpdeskPlan)

jest.mock('state/currentAccount/selectors', () => ({ isTrialing: jest.fn() }))
const getIsTrialingMock = assumeMock(getIsTrialing)

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
        useFlagMock.mockReturnValue(true)
        getCurrentUserMock.mockReturnValue(
            fromJS({
                email: 'test@example.com',
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
            },
        )
        expect(onToggle).toHaveBeenCalledWith()
    })
})
