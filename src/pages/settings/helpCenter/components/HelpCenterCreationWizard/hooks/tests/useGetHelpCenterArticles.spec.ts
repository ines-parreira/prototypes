import {renderHook} from '@testing-library/react-hooks'
import {assumeMock} from 'utils/testing'
import {useGetArticleTemplates} from 'pages/settings/helpCenter/queries'
import {useGetHelpCenterArticleList} from 'models/helpCenter/queries'
import {useGetHelpCenterArticles} from '../useGetHelpCenterArticles'

jest.mock('pages/settings/helpCenter/queries')
jest.mock('models/helpCenter/queries')

const mockedUseGetArticleTemplates = assumeMock(useGetArticleTemplates)
const mockedUseGetHelpCenterArticleList = assumeMock(
    useGetHelpCenterArticleList
)

const articleTemplates = [
    {
        key: 'howToCancelOrder',
        title: 'How do I cancel my order?',
        category: 'orderManagement',
        html_content: 'content',
    },
    {
        key: 'howToReturn',
        title: 'How do I make a return?',
        category: 'returnsAndRefunds',
        html_content: 'content',
    },
]

describe('useGetHelpCenterArticles', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseGetArticleTemplates.mockImplementation(() => {
            return {
                data: articleTemplates,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetArticleTemplates>
        })
        mockedUseGetHelpCenterArticleList.mockImplementation(() => {
            return {
                data: {data: []},
                isLoading: false,
            } as unknown as ReturnType<typeof useGetHelpCenterArticleList>
        })
    })
    it('should return template articles grouped by category when no articles created', () => {
        const {result} = renderHook(() => useGetHelpCenterArticles(1, 'en-US'))

        expect(mockedUseGetArticleTemplates).toHaveBeenCalled()
        expect(mockedUseGetHelpCenterArticleList).toHaveBeenCalled()

        expect(result.current.articles).toMatchObject({
            orderManagement: [
                {
                    key: 'howToCancelOrder',
                    title: 'How do I cancel my order?',
                    category: 'orderManagement',
                    content: 'content',
                    isSelected: true,
                },
            ],
            returnsAndRefunds: [
                {
                    key: 'howToReturn',
                    title: 'How do I make a return?',
                    category: 'returnsAndRefunds',
                    content: 'content',
                },
            ],
        })
        expect(result.current.isLoading).toBeFalsy()
    })

    it('should return default article group when there are no articles', () => {
        mockedUseGetArticleTemplates.mockImplementation(() => {
            return {
                data: null,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetArticleTemplates>
        })
        mockedUseGetHelpCenterArticleList.mockImplementation(() => {
            return {
                data: null,
                isLoading: false,
            } as unknown as ReturnType<typeof useGetHelpCenterArticleList>
        })
        const {result} = renderHook(() => useGetHelpCenterArticles(1, 'en-US'))

        expect(result.current.articles).toMatchObject({})
    })

    it('should select the first template article by default when no articles created', () => {
        const {result} = renderHook(() => useGetHelpCenterArticles(1, 'en-US'))
        expect(
            result.current.articles['orderManagement'][0].isSelected
        ).toBeTruthy()
    })

    it('should return article data when there are articles created based on a template', () => {
        mockedUseGetHelpCenterArticleList.mockImplementation(() => {
            return {
                data: {
                    data: [
                        {
                            id: 1,
                            template_key: 'howToReturn',
                            translation: {
                                title: 'How do I make a return from my account?',
                                content: 'Updated content',
                            },
                        },
                    ],
                },
                isLoading: false,
            } as unknown as ReturnType<typeof useGetHelpCenterArticleList>
        })

        const {result} = renderHook(() => useGetHelpCenterArticles(1, 'en-US'))

        expect(result.current.articles).toMatchObject({
            orderManagement: [
                {
                    key: 'howToCancelOrder',
                    title: 'How do I cancel my order?',
                    category: 'orderManagement',
                    content: 'content',
                },
            ],
            returnsAndRefunds: [
                {
                    key: 'howToReturn',
                    title: 'How do I make a return from my account?',
                    category: 'returnsAndRefunds',
                    content: 'Updated content',
                    isSelected: true,
                },
            ],
        })
        expect(result.current.isLoading).toBeFalsy()
    })

    it('should return only articles created from a template and ignore the rest', () => {
        mockedUseGetHelpCenterArticleList.mockImplementation(() => {
            return {
                data: {
                    data: [
                        {
                            id: 1,
                            template_key: 'howToReturn',
                            translation: {
                                title: 'How do I make a return from my account?',
                                content: 'Updated content',
                            },
                        },
                        {
                            id: 2,
                            translation: {
                                title: 'Custom article',
                                content: 'content for custom article',
                            },
                        },
                    ],
                },
                isLoading: false,
            } as unknown as ReturnType<typeof useGetHelpCenterArticleList>
        })

        const {result} = renderHook(() => useGetHelpCenterArticles(1, 'en-US'))

        expect(result.current.articles).toMatchObject({
            orderManagement: [
                {
                    key: 'howToCancelOrder',
                    title: 'How do I cancel my order?',
                    category: 'orderManagement',
                    content: 'content',
                },
            ],
            returnsAndRefunds: [
                {
                    key: 'howToReturn',
                    title: 'How do I make a return from my account?',
                    category: 'returnsAndRefunds',
                    content: 'Updated content',
                    isSelected: true,
                },
            ],
        })
        expect(result.current.isLoading).toBeFalsy()
    })
})
