import {fromJS, Map} from 'immutable'
import React from 'react'
import {UserRole} from 'config/types/user'
import {ChannelsEditColumns} from 'pages/stats/support-performance/channels/ChannelsEditColumns'
import {ChannelsCardExtra} from 'pages/stats/support-performance/channels/ChannelsCardExtra'
import {assumeMock, renderWithStore} from 'utils/testing'
import {ChannelsHeatmapSwitch} from 'pages/stats/support-performance/channels/ChannelsHeatmapSwitch'

jest.mock('pages/stats/support-performance/channels/ChannelsEditColumns')
const ChannelsEditColumnsMock = assumeMock(ChannelsEditColumns)
jest.mock('pages/stats/support-performance/channels/ChannelsHeatmapSwitch')
const ChannelsHeatmapSwitchMock = assumeMock(ChannelsHeatmapSwitch)

describe('ChannelsCardExtra', () => {
    const defaultState = {
        currentUser: fromJS({
            role: {name: UserRole.Admin},
        }) as Map<any, any>,
    }

    beforeEach(() => {
        ChannelsEditColumnsMock.mockImplementation(() => <div />)
        ChannelsHeatmapSwitchMock.mockImplementation(() => <div />)
    })

    it('should render heatmap switch and Table Columns Edit for admin user', () => {
        renderWithStore(<ChannelsCardExtra />, defaultState)

        expect(ChannelsEditColumnsMock).toHaveBeenCalled()
        expect(ChannelsHeatmapSwitchMock).toHaveBeenCalled()
    })

    it('should not render TableColumns Edit for regular user', () => {
        const state = {
            currentUser: fromJS({
                role: {name: UserRole.Agent},
            }) as Map<any, any>,
        }
        renderWithStore(<ChannelsCardExtra />, state)

        expect(ChannelsEditColumnsMock).not.toHaveBeenCalled()
        expect(ChannelsHeatmapSwitchMock).toHaveBeenCalled()
    })
})
