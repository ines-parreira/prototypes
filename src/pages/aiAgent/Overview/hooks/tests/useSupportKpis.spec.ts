import {renderHook} from '@testing-library/react-hooks'

import {useSupportKpis} from 'pages/aiAgent/Overview/hooks/useSupportKpis'

jest.mock('../useAutomatedInteractions', () => ({
    useAutomatedInteractions: jest.fn(() => 'mockAutomatedInteractions'),
}))
jest.mock('../useAutomationRate', () => ({
    useAutomationRate: jest.fn(() => 'mockAutomationRate'),
}))
jest.mock('../useCoverageRate', () => ({
    useCoverageRate: jest.fn(() => 'mockCoverageRate'),
}))
jest.mock('../useCsat', () => ({
    useCsat: jest.fn(() => 'mockCsat'),
}))

describe('useSupportKpis', () => {
    it('should return metrics from individual hooks', () => {
        const {result} = renderHook(() => useSupportKpis())

        expect(result.current.metrics).toEqual([
            'mockAutomationRate',
            'mockAutomatedInteractions',
            'mockCsat',
            'mockCoverageRate',
        ])
    })
})
