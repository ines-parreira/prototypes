import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import {assumeMock} from 'utils/testing'
import {useGetAIGeneratedGuidances} from 'models/aiAgent/queries'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/constants'
import {StoreState} from 'state/types'
import {useGuidanceAiSuggestions} from '../useGuidanceAiSuggestions'
import {useGuidanceArticles} from '../useGuidanceArticles'
import {getGuidanceArticleFixture} from '../../fixtures/guidanceArticle.fixture'
import {getAIGuidanceFixture} from '../../fixtures/aiGuidance.fixture'

jest.mock('../useGuidanceArticles')
jest.mock('models/aiAgent/queries')
jest.mock('hooks/useAppSelector')

const mockedUseGuidanceArticles = assumeMock(useGuidanceArticles)
const mockedUseAppSelector = assumeMock(useAppSelector)
const mockedUseGetAIGeneratedGuidances = (
    data: any,
    error: Error | null = null,
    isLoading: boolean = false
) => {
    ;(useGetAIGeneratedGuidances as jest.Mock).mockReturnValue({
        data,
        error,
        isLoading,
    })
}

const guidanceArticles = [
    getGuidanceArticleFixture(1, {
        title: 'Old article',
        lastUpdated: '2024-03-18T12:21:00.531Z',
    }),
    getGuidanceArticleFixture(2, {
        title: 'New article',
        lastUpdated: '2024-04-18T12:21:00.531Z',
    }),
]

const helpCenterId = 123
const shopName = 'example-shop'

describe('useGuidanceAiSuggestions', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseGuidanceArticles.mockReturnValue({
            guidanceArticles,
            isGuidanceArticleListLoading: false,
        })
        mockedUseAppSelector.mockImplementation((selector) =>
            selector({
                integrations: fromJS({
                    integrations: [
                        {id: 1, type: IntegrationType.Shopify, name: 'My Shop'},
                    ],
                }),
            } as unknown as StoreState)
        )
    })

    it('should return isGuidancesOnly true', () => {
        mockedUseGetAIGeneratedGuidances([])

        const {result} = renderHook(() =>
            useGuidanceAiSuggestions({
                helpCenterId,
                shopName,
            })
        )

        expect(result.current.guidanceArticles).toEqual(guidanceArticles)
        expect(result.current.isLoading).toEqual(false)
        expect(result.current.guidanceAISuggestions).toEqual([])
        expect(result.current.isAllAIGuidancesUsed).toEqual(false)
        expect(result.current.isEmptyStateNoAIGuidances).toEqual(false)
        expect(result.current.isEmptyStateAIGuidances).toEqual(false)
        expect(result.current.isGuidancesOnly).toEqual(true)
        expect(result.current.isGuidancesAndAIGuidances).toEqual(false)
    })

    it('should return isGuidancesAndAIGuidances true', () => {
        const aiGuidances = [
            {...getAIGuidanceFixture('1'), review_action: 'none'},
            {...getAIGuidanceFixture('2'), review_action: 'created'},
        ]

        mockedUseGetAIGeneratedGuidances(aiGuidances)

        const {result} = renderHook(() =>
            useGuidanceAiSuggestions({
                helpCenterId,
                shopName,
            })
        )

        expect(result.current.guidanceArticles).toEqual(guidanceArticles)
        expect(result.current.isLoading).toEqual(false)
        expect(result.current.guidanceAISuggestions).toEqual([aiGuidances[0]])
        expect(result.current.isAllAIGuidancesUsed).toEqual(false)
        expect(result.current.isEmptyStateNoAIGuidances).toEqual(false)
        expect(result.current.isEmptyStateAIGuidances).toEqual(false)
        expect(result.current.isGuidancesOnly).toEqual(false)
        expect(result.current.isGuidancesAndAIGuidances).toEqual(true)
    })

    it('should return isEmptyStateNoAIGuidances true', () => {
        mockedUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })

        mockedUseGetAIGeneratedGuidances([])

        const {result} = renderHook(() =>
            useGuidanceAiSuggestions({
                helpCenterId,
                shopName,
            })
        )

        expect(result.current.guidanceArticles).toEqual([])
        expect(result.current.isLoading).toEqual(false)
        expect(result.current.guidanceAISuggestions).toEqual([])
        expect(result.current.isAllAIGuidancesUsed).toEqual(false)
        expect(result.current.isEmptyStateNoAIGuidances).toEqual(true)
        expect(result.current.isEmptyStateAIGuidances).toEqual(false)
        expect(result.current.isGuidancesOnly).toEqual(false)
        expect(result.current.isGuidancesAndAIGuidances).toEqual(false)
    })

    it('should return isEmptyStateAIGuidances true', () => {
        mockedUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })

        const aiGuidances = [
            {...getAIGuidanceFixture('1'), review_action: 'none'},
            {...getAIGuidanceFixture('2'), review_action: 'none'},
        ]

        mockedUseGetAIGeneratedGuidances(aiGuidances)

        const {result} = renderHook(() =>
            useGuidanceAiSuggestions({
                helpCenterId,
                shopName,
            })
        )

        expect(result.current.guidanceArticles).toEqual([])
        expect(result.current.isLoading).toEqual(false)
        expect(result.current.guidanceAISuggestions).toEqual(aiGuidances)
        expect(result.current.isAllAIGuidancesUsed).toEqual(false)
        expect(result.current.isEmptyStateNoAIGuidances).toEqual(false)
        expect(result.current.isEmptyStateAIGuidances).toEqual(true)
        expect(result.current.isGuidancesOnly).toEqual(false)
        expect(result.current.isGuidancesAndAIGuidances).toEqual(false)
    })

    it('should return isAllAIGuidancesUsed true', () => {
        mockedUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })

        const aiGuidances = [
            {...getAIGuidanceFixture('1'), review_action: 'created'},
            {...getAIGuidanceFixture('2'), review_action: 'created'},
        ]

        mockedUseGetAIGeneratedGuidances(aiGuidances)

        const {result} = renderHook(() =>
            useGuidanceAiSuggestions({
                helpCenterId,
                shopName,
            })
        )

        expect(result.current.guidanceArticles).toEqual([])
        expect(result.current.isLoading).toEqual(false)
        expect(result.current.guidanceAISuggestions).toEqual([])
        expect(result.current.isAllAIGuidancesUsed).toEqual(true)
        expect(result.current.isEmptyStateNoAIGuidances).toEqual(false)
        expect(result.current.isEmptyStateAIGuidances).toEqual(false)
        expect(result.current.isGuidancesOnly).toEqual(false)
        expect(result.current.isGuidancesAndAIGuidances).toEqual(false)
    })

    it('should get ai guidance by id', () => {
        mockedUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })

        const aiGuidances = [
            {...getAIGuidanceFixture('1'), review_action: 'none'},
            {...getAIGuidanceFixture('2'), review_action: 'none'},
        ]

        mockedUseGetAIGeneratedGuidances(aiGuidances)

        const {result} = renderHook(() =>
            useGuidanceAiSuggestions({
                helpCenterId,
                shopName,
            })
        )

        const aiGuidanceSuggestion = result.current.getAiGuidanceById('1')

        expect(aiGuidanceSuggestion).toBeDefined()
        expect(aiGuidanceSuggestion?.name).toBe('Name 1')
    })

    it('should return null when there are no AI guidances', () => {
        mockedUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })

        const aiGuidances = null

        mockedUseGetAIGeneratedGuidances(aiGuidances)

        const {result} = renderHook(() =>
            useGuidanceAiSuggestions({
                helpCenterId,
                shopName,
            })
        )

        const aiGuidanceSuggestion = result.current.getAiGuidanceById('1')

        expect(aiGuidanceSuggestion).toBeNull()
    })

    it('should return null when there is no AI Guidance found by id', () => {
        mockedUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })

        const aiGuidances = [
            {...getAIGuidanceFixture('1'), review_action: 'none'},
            {...getAIGuidanceFixture('2'), review_action: 'none'},
        ]

        mockedUseGetAIGeneratedGuidances(aiGuidances)

        const {result} = renderHook(() =>
            useGuidanceAiSuggestions({
                helpCenterId,
                shopName,
            })
        )

        const aiGuidanceSuggestion = result.current.getAiGuidanceById('10')
        expect(aiGuidanceSuggestion).toBeNull()
    })
})
