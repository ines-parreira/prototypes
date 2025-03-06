import { renderHook } from '@testing-library/react-hooks'

import { useSupportKpis } from 'pages/aiAgent/Overview/hooks/useSupportKpis'

jest.mock('pages/aiAgent/Overview/hooks/kpis/useAutomatedInteractions', () => ({
    useAutomatedInteractions: jest.fn(() => 'mockAutomatedInteractions'),
}))
jest.mock('pages/aiAgent/Overview/hooks/kpis/useAutomationRate', () => ({
    useAutomationRate: jest.fn(() => 'mockAutomationRate'),
}))
jest.mock('pages/aiAgent/Overview/hooks/kpis/useCoverageRate', () => ({
    useCoverageRate: jest.fn(() => 'mockCoverageRate'),
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

describe('useSupportKpis', () => {
    it('should return metrics from individual hooks', () => {
        const { result } = renderHook(() => useSupportKpis(filters, timezone))

        expect(result.current.metrics).toEqual([
            'mockCoverageRate',
            'mockAutomationRate',
            'mockAutomatedInteractions',
            'mockCsat',
        ])
    })
})
