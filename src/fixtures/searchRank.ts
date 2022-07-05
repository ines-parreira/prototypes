import {SearchRank} from 'hooks/useSearchRankScenario'

export const mockSearchRank: SearchRank = {
    isRunning: false,
    registerResultsRequest: jest.fn(),
    registerResultsResponse: jest.fn(),
    registerResultSelection: jest.fn(),
    endScenario: jest.fn(),
}
