import {renderHook} from '@testing-library/react-hooks'

import {useSalesKpis} from '../useSalesKpis'

jest.mock('../useCoverageRate', () => ({
    useCoverageRate: jest.fn(() => 'mockCoverageRate'),
}))
jest.mock('../useGmvInfluenced', () => ({
    useGmvInfluenced: jest.fn(() => 'mockGmvInfluenced'),
}))
jest.mock('../useTotalConversations', () => ({
    useTotalConversations: jest.fn(() => 'mockTotalConversations'),
}))
jest.mock('../useCsat', () => ({
    useCsat: jest.fn(() => 'mockCsat'),
}))

describe('useSalesKpis', () => {
    it('should return metrics containing correct KPIs', () => {
        const {result} = renderHook(() => useSalesKpis())

        expect(result.current.metrics).toEqual([
            'mockCoverageRate',
            'mockGmvInfluenced',
            'mockTotalConversations',
            'mockCsat',
        ])
    })
})
