import {renderHook} from '@testing-library/react-hooks'

import {useSalesKpis} from '../useSalesKpis'

jest.mock('pages/aiAgent/Overview/hooks/kpis/useCoverageRate', () => ({
    useCoverageRate: jest.fn(() => 'mockCoverageRate'),
}))
jest.mock('pages/aiAgent/Overview/hooks/kpis/useTotalConversations', () => ({
    useTotalConversations: jest.fn(() => 'mockTotalConversations'),
}))
jest.mock('pages/aiAgent/Overview/hooks/kpis/useCsat', () => ({
    useCsat: jest.fn(() => 'mockCsat'),
}))

const timezone = 'UTC'

const filters = {
    period: {
        start_datetime: '',
        end_datetime: '',
    },
}

describe('useSalesKpis', () => {
    it('should return metrics containing correct KPIs', () => {
        const {result} = renderHook(() => useSalesKpis(filters, timezone))

        expect(result.current.metrics).toEqual([
            'mockCoverageRate',
            'mockTotalConversations',
            'mockCsat',
        ])
    })
})
