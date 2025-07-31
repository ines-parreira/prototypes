import React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { UserSettingType } from 'config/types/user'
import {
    DateAndTimeFormatting,
    DateFormatType,
    TimeFormatType,
} from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'

describe('useGetDateAndTimeFormat', () => {
    it('should test en-GB format', () => {
        const store = configureMockStore([thunk])({
            currentUser: fromJS({
                id: 1,
                email: 'steve@acme.gorgias.io',
                settings: [
                    {
                        data: {
                            date_format: DateFormatType.en_GB,
                            time_format: TimeFormatType.TwentyFourHour,
                        },
                        id: 21,
                        type: UserSettingType.Preferences,
                    },
                ],
            }),
        })
        const { result } = renderHook(
            () =>
                useGetDateAndTimeFormat(
                    DateAndTimeFormatting.CompactDateWithTime,
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )
        expect(result.current).toEqual('DD/MM/YYYY HH:mm')
    })
    it('should test en-US format', () => {
        const store = configureMockStore([thunk])({
            currentUser: fromJS({
                id: 1,
                email: 'steve@acme.gorgias.io',
                settings: [
                    {
                        data: {
                            date_format: DateFormatType.en_US,
                            time_format: TimeFormatType.AmPm,
                        },
                        id: 21,
                        type: UserSettingType.Preferences,
                    },
                ],
            }),
        })
        const { result } = renderHook(
            () =>
                useGetDateAndTimeFormat(
                    DateAndTimeFormatting.CompactDateWithTime,
                ),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )
        expect(result.current).toEqual('MM/DD/YYYY hh:mm A')
    })
})
