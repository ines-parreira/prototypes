import { SankeyChart } from '@repo/reporting'
import type { SankeyChartData } from '@repo/reporting'
import { render } from '@testing-library/react'

import { ConversationFunnelCard } from './ConversationFunnelCard'

jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    SankeyChart: jest.fn(() => null),
}))

const mockSankeyChart = SankeyChart as jest.Mock

describe('ConversationFunnelCard', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
    })

    const mockData: SankeyChartData = {
        nodes: [
            { name: 'Source A', color: '#A084E1' },
            { name: 'Target B', color: '#F08080' },
        ],
        links: [{ source: 'Source A', target: 'Target B', value: 100 }],
    }

    it('should render the card title', () => {
        const { getByText } = render(<ConversationFunnelCard data={mockData} />)

        expect(getByText('Conversation funnel')).toBeInTheDocument()
    })

    it('should render the SankeyChart', () => {
        render(<ConversationFunnelCard data={mockData} />)

        expect(mockSankeyChart).toHaveBeenCalledWith(
            expect.objectContaining({ data: mockData }),
            expect.anything(),
        )
    })
})
