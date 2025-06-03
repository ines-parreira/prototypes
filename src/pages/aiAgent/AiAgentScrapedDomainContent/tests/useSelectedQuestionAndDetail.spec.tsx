import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetHelpCenterArticle,
    useGetIngestedResource,
} from 'models/helpCenter/queries'
import { getIngestedResourceFixture } from 'pages/aiAgent/fixtures/ingestedResource.fixture'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import history from 'pages/history'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useSelectedQuestionAndDetail } from '../hooks/useSelectedQuestionAndDetail'

jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = assumeMock(useAppDispatch)
const mockDispatch = jest.fn()

jest.mock('models/helpCenter/queries', () => ({
    ...jest.requireActual('models/helpCenter/queries'),
    useGetIngestedResource: jest.fn(),
    useGetHelpCenterArticle: jest.fn(),
}))
const mockUseGetIngestedResource = assumeMock(useGetIngestedResource)
const mockUseGetHelpCenterArticle = assumeMock(useGetHelpCenterArticle)

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)

describe('useSelectedQuestionAndDetail', () => {
    const mockedSelectedId = 12345
    const mockedShopName = 'Test Shop'
    const mockedStoreDomainIngestionLogId = 123
    const mockedHelpCenterId = 1
    const mockedDefaultLocale = 'en-US'
    const mockedIngestedResource = getIngestedResourceFixture({
        article_ingestion_log_id: mockedStoreDomainIngestionLogId,
    })
    const mockedArticleData = {
        available_locales: ['en-US'],
        help_center_id: 1,
        id: 1,
        translation: {
            article_id: 10,
            content: '<div>This article exists</div>',
            title: 'Article A',
            slug: 'article-a',
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseGetIngestedResource.mockReturnValue({
            isLoading: false,
            isError: false,
            data: null,
        } as unknown as ReturnType<typeof useGetIngestedResource>)
        mockUseGetHelpCenterArticle.mockReturnValue({
            data: null,
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetHelpCenterArticle>)
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                main: '/main',
                pagesContent: '/knowledge/sources/pages-content',
            },
            navigationItems: [],
        } as unknown as ReturnType<typeof useAiAgentNavigation>)
    })

    it('returns ingested resource and article data when both queries succeed', () => {
        mockUseGetIngestedResource.mockReturnValue({
            isLoading: false,
            isError: false,
            data: mockedIngestedResource,
        } as unknown as ReturnType<typeof useGetIngestedResource>)

        mockUseGetHelpCenterArticle.mockReturnValue({
            data: mockedArticleData,
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetHelpCenterArticle>)

        const { result } = renderHook(() =>
            useSelectedQuestionAndDetail({
                shopName: mockedShopName,
                helpCenterId: mockedHelpCenterId,
                defaultLocale: mockedDefaultLocale,
                selectedId: mockedSelectedId,
                storeDomainIngestionLogId: mockedStoreDomainIngestionLogId,
            }),
        )

        expect(result.current.selectedQuestion).toEqual(mockedIngestedResource)
        expect(result.current.questionDetail).toEqual(mockedArticleData)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('redirects and show error notification when product is not found', () => {
        mockUseGetIngestedResource.mockReturnValue({
            isLoading: false,
            isError: true,
            data: null,
        } as unknown as ReturnType<typeof useGetIngestedResource>)

        const { result } = renderHook(() =>
            useSelectedQuestionAndDetail({
                shopName: mockedShopName,
                helpCenterId: mockedHelpCenterId,
                defaultLocale: mockedDefaultLocale,
                selectedId: mockedSelectedId,
                storeDomainIngestionLogId: mockedStoreDomainIngestionLogId,
            }),
        )

        expect(notify).toHaveBeenCalledWith({
            message:
                'Content no longer exists. It may have been deleted or moved.',
            status: NotificationStatus.Error,
        })
        expect(history.push).toHaveBeenCalledWith(
            '/knowledge/sources/pages-content',
        )
        expect(result.current.selectedQuestion).toBeNull()
        expect(result.current.questionDetail).toBeNull()
    })
})
