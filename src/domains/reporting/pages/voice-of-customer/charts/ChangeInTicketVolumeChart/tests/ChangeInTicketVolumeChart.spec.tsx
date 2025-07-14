import { render } from '@testing-library/react'

import { ChangeInTicketVolumeChart } from 'domains/reporting/pages/voice-of-customer/charts/ChangeInTicketVolumeChart/ChangeInTicketVolumeChart'
import { TicketVolumeTable } from 'domains/reporting/pages/voice-of-customer/charts/ChangeInTicketVolumeChart/TicketVolumeTable'
import { assumeMock } from 'utils/testing'

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
