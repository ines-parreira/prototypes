import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { renderWithStore } from 'utils/testing'

import { SETTING_TYPE_BUSINESS_HOURS } from '../../../../state/currentAccount/constants'
import BusinessHoursDisplay from '../BusinessHoursDisplay'

const defaultStoreBusinessHours = {
    data: {
        business_hours: [
            {
                days: '1,2,3,4,5',
                from_time: '09:00',
                to_time: '17:00',
            },
        ],
        timezone: 'UTC',
    },
}

const renderComponent = (
    businessHours?: any,
    storeBusinessHours = defaultStoreBusinessHours,
) => {
    const storeState = {
        currentAccount: fromJS({
            settings: [
                {
                    type: SETTING_TYPE_BUSINESS_HOURS,
                    ...storeBusinessHours,
                },
            ],
        }),
    }

    return renderWithStore(
        <BusinessHoursDisplay businessHours={businessHours} />,
        storeState,
    )
}

describe('BusinessHoursDisplay', () => {
    it('should render default business hours when no custom business hours provided', () => {
        renderComponent()

        expect(screen.getByText('Default')).toBeInTheDocument()
        expect(screen.getByText('Mon-Fri, 09:00-17:00')).toBeInTheDocument()
    })

    it('should render custom business hours when provided', () => {
        const customBusinessHours = {
            days: '1,2,3,4,5,6,7',
            from_time: '08:00',
            to_time: '18:00',
        }

        renderComponent(customBusinessHours)

        expect(screen.getByText('Custom')).toBeInTheDocument()
        expect(screen.getByText('Everyday, 08:00-18:00')).toBeInTheDocument()
    })

    it('should handle unknown day values gracefully', () => {
        const unknownDayBusinessHours = {
            days: '99',
            from_time: '12:00',
            to_time: '20:00',
        }

        renderComponent(unknownDayBusinessHours)

        expect(screen.getByText('Custom')).toBeInTheDocument()
        expect(screen.getByText('12:00-20:00')).toBeInTheDocument()
    })
})
