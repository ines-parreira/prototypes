import React from 'react'

import { render } from '@repo/testing'
import { fromJS } from 'immutable'
import { noop } from '@gorgias/toolkit'
import { TicketChannel } from 'business/types/ticket'
import { useStatResource } from 'domains/reporting/hooks/useStatResource'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AutomateMacros } from 'domains/reporting/pages/ticket-insights/macros/AutomateMacros'
import { integrationsState } from 'fixtures/integrations'
import { messagesSentPerMacro } from 'fixtures/stats'
import type { RootState } from 'state/types'

jest.mock(
    'pages/aiAgent/analyticsOverview/components/NewAutomateStatsOptInBanner/NewAutomateStatsOptInBanner',
    () => ({
        NewAutomateStatsOptInBanner: () => null,
    }),
)

jest.mock('domains/reporting/hooks/useStatResource')
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)
jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)
jest.mock(
    'domains/reporting/pages/common/filters/DEPRECATED_ChannelsStatsFilter',
    () => ({
        DEPRECATED_ChannelsStatsFilter: () => <div>ChannelsStatsFilter</div>,
    }),
)

const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>

describe('AutomateMacros', () => {
    const defaultState = {
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: withDefaultLogicalOperator([TicketChannel.Chat]),
                integrations: withDefaultLogicalOperator([
                    integrationsState.integrations[0].id,
                ]),
            },
        },
        integrations: fromJS(integrationsState),
    } as RootState

    beforeEach(() => {
        useStatResourceMock.mockReturnValue([null, true, noop])
    })

    it('should render the filters and stats when stats filters are defined', () => {
        useStatResourceMock.mockReturnValue([messagesSentPerMacro, false, noop])

        const { container } = render(<AutomateMacros />, {
            storeState: defaultState,
        })

        expect(container.firstChild).toMatchSnapshot()
    })
})
