import { renderHook } from '@testing-library/react-hooks'

import useAppDispatch from 'hooks/useAppDispatch'
import useQAScoreFilters from 'pages/common/components/ViewTable/Filters/hooks/useQAScoreFilters'
import * as qaScoreDimensions from 'pages/common/components/ViewTable/Filters/utils/qaScoreDimensions'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

describe('useQAScoreFilters', () => {
    const objectPath = 'ticket.qa_score_dimensions'
    const index = 0
    let dispatchMock: jest.Mock
    let getQaScoreDimensionSpy: jest.SpyInstance

    beforeEach(() => {
        dispatchMock = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatchMock)
        getQaScoreDimensionSpy = jest.spyOn(
            qaScoreDimensions,
            'getQaScoreDimensionFromObjectPath',
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should call updateDimensionState when onQAScoreDimensionFieldChange is invoked', () => {
        const { result } = renderHook(() =>
            useQAScoreFilters({ objectPath, index }),
        )

        result.current.onQAScoreDimensionFieldChange('language_proficiency')

        expect(dispatchMock).toHaveBeenCalledWith({
            type: 'UPDATE_VIEW_QA_SCORE_FILTER_DIMENSION',
            index,
            qaScoreDimension: 'language_proficiency',
        })
    })

    it('should return the correct qaScoreDimension from objectPath', () => {
        const { result } = renderHook(() =>
            useQAScoreFilters({ objectPath, index }),
        )

        expect(result.current.qaScoreDimension).toBe(
            qaScoreDimensions.getQaScoreDimensionFromObjectPath(objectPath),
        )
        expect(getQaScoreDimensionSpy).toHaveBeenCalledWith(objectPath)
    })
})
