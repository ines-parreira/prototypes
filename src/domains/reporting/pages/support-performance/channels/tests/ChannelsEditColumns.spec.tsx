import React from 'react'

import { render } from '@testing-library/react'

import { useChannelsTableSetting } from 'domains/reporting/hooks/useChannelsTableConfigSetting'
import { EditTableColumns } from 'domains/reporting/pages/common/components/Table/EditTableColumns'
import { ChannelsEditColumns } from 'domains/reporting/pages/support-performance/channels/ChannelsEditColumns'
import {
    ChannelColumnConfig,
    ChannelsTableLabels,
    ChannelsTableViews,
    LeadColumn,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import { getChannelsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/pages/common/components/Table/EditTableColumns')
const EditTableColumnsMock = assumeMock(EditTableColumns)

describe('ChannelsEditColumns', () => {
    beforeEach(() => {
        EditTableColumnsMock.mockImplementation(() => <div />)
    })
    it('should call the EditTableColumns with Channel specific props', () => {
        render(<ChannelsEditColumns />)

        expect(EditTableColumnsMock).toHaveBeenCalledWith(
            {
                settingsSelector: getChannelsTableConfigSettingsJS,
                fallbackViews: ChannelsTableViews,
                tableLabels: ChannelsTableLabels,
                tooltips: ChannelColumnConfig,
                leadColumn: LeadColumn,
                useTableSetting: useChannelsTableSetting,
            },
            {},
        )
    })
})
