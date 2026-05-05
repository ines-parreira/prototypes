import { assumeMock, render } from '@repo/testing'

import { ChangeInTicketVolumeChart } from 'domains/reporting/pages/voice-of-customer/charts/ChangeInTicketVolumeChart/ChangeInTicketVolumeChart'
import { TicketVolumeTable } from 'domains/reporting/pages/voice-of-customer/charts/ChangeInTicketVolumeChart/TicketVolumeTable'

jest.mock(
    'domains/reporting/pages/voice-of-customer/charts/ChangeInTicketVolumeChart/TicketVolumeTable',
)
const TicketVolumeTableMock = assumeMock(TicketVolumeTable)

describe('ChangeInTicketVolumeChart', () => {
    beforeEach(() => {
        TicketVolumeTableMock.mockImplementation(() => <div />)
    })

    it('should render TicketVolumeTable', () => {
        render(<ChangeInTicketVolumeChart />)

        expect(TicketVolumeTableMock).toHaveBeenCalled()
    })
})
