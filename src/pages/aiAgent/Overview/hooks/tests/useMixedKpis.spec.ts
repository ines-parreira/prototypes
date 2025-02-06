import {renderHook} from '@testing-library/react-hooks'

import {useMixedKpis} from '../useMixedKpis'

jest.mock('../useCoverageRate', () => ({
    useCoverageRate: jest.fn(() => 'mockCoverageRate'),
}))
jest.mock('../useGmvInfluenced', () => ({
    useGmvInfluenced: jest.fn(() => 'mockGmvInfluenced'),
}))
jest.mock('../useAutomationRate', () => ({
    useAutomationRate: jest.fn(() => 'mockAutomationRate'),
}))
jest.mock('../useCsat', () => ({
    useCsat: jest.fn(() => 'mockCsat'),
}))

const timezone = 'UTC'

const filters = {
    period: {
        start_datetime: '',
        end_datetime: '',
    },
}

describe('useMixedKpis', () => {
    it('should return metrics from individual hooks', () => {
        const {result} = renderHook(() => useMixedKpis(filters, timezone))

        expect(result.current.metrics).toEqual([
            'mockCoverageRate',
            'mockGmvInfluenced',
            'mockAutomationRate',
            'mockCsat',
        ])
    })
})
