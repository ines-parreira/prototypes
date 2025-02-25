import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import { submitSetting } from 'state/currentUser/actions'
import {
    isAvailable as getIsAvailable,
    getIsPreferencesLoading,
    getPreferences,
} from 'state/currentUser/selectors'
import { assumeMock } from 'utils/testing'

import AvailabilityToggle from '../AvailabilityToggle'

jest.mock(
    'common/segment',
    () =>
        ({
            ...jest.requireActual('common/segment'),
            logEvent: jest.fn(),
        }) as typeof import('common/segment'),
)

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('state/currentUser/actions', () => ({ submitSetting: jest.fn() }))

jest.mock('state/currentUser/selectors', () => ({
    getIsPreferencesLoading: jest.fn(),
    getPreferences: jest.fn(),
    isAvailable: jest.fn(),
}))
const getIsAvailableMock = assumeMock(getIsAvailable)
const getIsPreferencesLoadingMock = assumeMock(getIsPreferencesLoading)
const getPreferencesMock = assumeMock(getPreferences)

describe('AvailabilityToggle', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)

        getIsAvailableMock.mockReturnValue(true)
        getIsPreferencesLoadingMock.mockReturnValue(false)
        getPreferencesMock.mockReturnValue(
            fromJS({ data: { available: true } }),
        )
    })

    it('should represent the available state', () => {
        const { getByRole } = render(<AvailabilityToggle />)
        expect(getByRole('checkbox')).toBeChecked()
    })

    it('should represent the unavailable state', () => {
        getIsAvailableMock.mockReturnValue(false)
        const { getByRole } = render(<AvailabilityToggle />)
        expect(getByRole('checkbox')).not.toBeChecked()
    })

    it('should update the availablity', () => {
        const { getByRole } = render(<AvailabilityToggle />)
        fireEvent.click(getByRole('switch'))
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            { link: 'available-on-off' },
        )
        expect(submitSetting).toHaveBeenCalledWith(
            { data: { available: false } },
            false,
        )
    })
})
