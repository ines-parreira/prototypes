import { render } from '@testing-library/react'

import { ChangeInTicketVolumeChart } from 'pages/stats/voice-of-customer/product-insights/charts/ChangeInTicketVolumeChart'
import { TicketVolumeTable } from 'pages/stats/voice-of-customer/product-insights/charts/TicketVolumeTable'
import { assumeMock } from 'utils/testing'

jest.mock(
    'pages/stats/voice-of-customer/product-insights/charts/TicketVolumeTable',
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
