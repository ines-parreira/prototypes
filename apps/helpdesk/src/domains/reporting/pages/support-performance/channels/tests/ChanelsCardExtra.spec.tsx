import React from 'react'

import { assumeMock } from '@repo/testing'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { ChannelsCardExtra } from 'domains/reporting/pages/support-performance/channels/ChannelsCardExtra'
import { ChannelsEditColumns } from 'domains/reporting/pages/support-performance/channels/ChannelsEditColumns'
import { ChannelsHeatmapSwitch } from 'domains/reporting/pages/support-performance/channels/ChannelsHeatmapSwitch'
import { renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/support-performance/channels/ChannelsEditColumns',
)
const ChannelsEditColumnsMock = assumeMock(ChannelsEditColumns)
jest.mock(
    'domains/reporting/pages/support-performance/channels/ChannelsHeatmapSwitch',
)
const ChannelsHeatmapSwitchMock = assumeMock(ChannelsHeatmapSwitch)

describe('ChannelsCardExtra', () => {
    const defaultState = {
        currentUser: fromJS({
            role: { name: UserRole.Admin },
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
                role: { name: UserRole.Agent },
            }) as Map<any, any>,
        }
        renderWithStore(<ChannelsCardExtra />, state)

        expect(ChannelsEditColumnsMock).not.toHaveBeenCalled()
        expect(ChannelsHeatmapSwitchMock).toHaveBeenCalled()
    })
})
