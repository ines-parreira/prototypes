import {renderHook, act} from '@testing-library/react-hooks'
import {HelpCenterArticleItem} from 'models/helpCenter/types'
import {useHelpCenterArticlesForm} from '../useHelpCenterArticlesForm'

const mockedSetEditModal = jest.fn()

const mockedUseEditionManager = {
    editModal: {
        isOpened: true,
    },
    setEditModal: mockedSetEditModal,
}

jest.mock('pages/settings/helpCenter/providers/EditionManagerContext', () => {
    const module: Record<string, unknown> = jest.requireActual(
        'pages/settings/helpCenter/providers/EditionManagerContext'
    )

    return {
        ...module,
        useEditionManager: () => mockedUseEditionManager,
    }
})

const articles = {
    orderManagement: [
        {
            key: 'howToCancelOrder',
            title: 'How do I cancel my order?',
        } as HelpCenterArticleItem,
    ],
    returnsAndRefunds: [
        {
            key: 'howToReturn',
            title: 'How do I make a return?',
        } as HelpCenterArticleItem,
    ],
    shippingAndDelivery: [
        {
            key: 'shippingPolicy',
            title: 'How do I track my order?',
        } as HelpCenterArticleItem,
    ],
}

describe('useHelpCenterArticlesForm', () => {
    it('should initialize with default values', () => {
        const {result} = renderHook(() => useHelpCenterArticlesForm(articles))

        expect(result.current.articles).toEqual(articles)
        expect(result.current.selectedArticle).toBeNull()
    })

    it('should update articles when the input changes', () => {
        const {result, rerender} = renderHook(
            (props) => useHelpCenterArticlesForm(props),
            {
                initialProps: articles,
            }
        )

        const newArticle = {
            key: 'howToCancelOrder',
            title: 'How do I cancel my order <updated>?',
        } as HelpCenterArticleItem

        const updatedArticles = {
            ...articles,
            orderManagement: [...articles.orderManagement, newArticle],
        }

        rerender(updatedArticles)

        expect(result.current.articles).toEqual(updatedArticles)
    })

    it('should handle article selection', () => {
        const {result} = renderHook(() => useHelpCenterArticlesForm(articles))

        act(() => {
            result.current.handleArticleSelect('howToCancelOrder')
        })

        expect(result.current.articles.orderManagement[0].isSelected).toBe(true)
    })

    it('should handle article edit', () => {
        const {result} = renderHook(() => useHelpCenterArticlesForm(articles))

        act(() => {
            result.current.handleArticleEdit('howToCancelOrder')
        })

        expect(result.current.selectedArticle).toEqual({
            key: 'howToCancelOrder',
            title: 'How do I cancel my order?',
        })
        expect(mockedSetEditModal).toHaveBeenCalledWith({
            isOpened: true,
            view: null,
        })
    })

    it('should handle editor close', () => {
        const {result} = renderHook(() => useHelpCenterArticlesForm(articles))

        act(() => {
            result.current.handleEditorClose()
        })

        expect(result.current.selectedArticle).toBeNull()
        expect(mockedSetEditModal).toHaveBeenCalled()
    })

    it('should handle editor ready', () => {
        const {result} = renderHook(() => useHelpCenterArticlesForm(articles))

        const content = '<p>><strong>Test</strong></p>'

        act(() => {
            result.current.handleArticleEdit('howToCancelOrder')
        })

        expect(result.current.selectedArticle).toEqual({
            key: 'howToCancelOrder',
            title: 'How do I cancel my order?',
        })

        act(() => {
            result.current.handleEditorReady(content)
        })

        expect(result.current.selectedArticle?.content).toBe(content)
    })

    it('should handle editor save', () => {
        const {result} = renderHook(() => useHelpCenterArticlesForm(articles))

        act(() => {
            result.current.handleArticleEdit('howToCancelOrder')
        })

        expect(result.current.selectedArticle).toEqual({
            key: 'howToCancelOrder',
            title: 'How do I cancel my order?',
        })

        act(() => {
            result.current.handleEditorSave(
                'How do I cancel my order <updated>?',
                '<p>><strong>Test</strong></p>'
            )
        })

        const updatedArticle = result.current.articles.orderManagement[0]

        expect(updatedArticle).toMatchObject({
            key: 'howToCancelOrder',
            title: 'How do I cancel my order <updated>?',
            content: '<p>><strong>Test</strong></p>',
        })
        expect(mockedSetEditModal).toHaveBeenCalled()
    })

    it('should not update articles if key not found', () => {
        const {result} = renderHook(() => useHelpCenterArticlesForm(articles))

        result.current.selectedArticle = null

        act(() => {
            result.current.handleEditorSave(
                'How do I cancel my order <updated>?',
                '<p>><strong>Test</strong></p>'
            )
        })

        expect(result.current.articles).toMatchObject(articles)
        expect(mockedSetEditModal).not.toHaveBeenCalled()
    })
})
