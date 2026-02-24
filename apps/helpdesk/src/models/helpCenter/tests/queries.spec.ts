import { useQuery } from '@tanstack/react-query'

import { useHelpCenterApi } from '../../../pages/settings/helpCenter/hooks/useHelpCenterApi'
import { helpCenterKeys, useGetArticleTranslationIntents } from '../queries'
import { getArticleTranslationIntents } from '../resources'

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn(),
}))

jest.mock('../../../pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

jest.mock('../resources', () => ({
    ...jest.requireActual('../resources'),
    getArticleTranslationIntents: jest.fn(),
}))

const mockUseQuery = useQuery as jest.Mock
const mockUseHelpCenterApi = useHelpCenterApi as jest.Mock
const mockGetArticleTranslationIntents =
    getArticleTranslationIntents as jest.Mock

describe('helpCenter queries', () => {
    const client = { some: 'client' }
    const pathParams = {
        help_center_id: 123,
        article_id: 456,
        locale: 'en',
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseHelpCenterApi.mockReturnValue({ client })
        mockUseQuery.mockReturnValue({ data: undefined })
        mockGetArticleTranslationIntents.mockResolvedValue({ intents: [] })
    })

    it('creates article translation intents key', () => {
        expect(
            helpCenterKeys.articleTranslationIntents(
                pathParams.help_center_id,
                pathParams.article_id,
                pathParams.locale,
            ),
        ).toEqual([
            ...helpCenterKeys.article(
                pathParams.help_center_id,
                pathParams.article_id,
            ),
            'translation-intents',
            pathParams.locale,
        ])
    })

    it('configures useQuery for article translation intents', async () => {
        useGetArticleTranslationIntents(pathParams)

        const queryOptions = mockUseQuery.mock.calls[0][0]

        expect(queryOptions.queryKey).toEqual(
            helpCenterKeys.articleTranslationIntents(
                pathParams.help_center_id,
                pathParams.article_id,
                pathParams.locale,
            ),
        )
        expect(queryOptions.staleTime).toBe(10 * 60 * 1000)
        expect(queryOptions.cacheTime).toBe(10 * 60 * 1000)
        expect(queryOptions.enabled).toBe(true)

        await queryOptions.queryFn()

        expect(mockGetArticleTranslationIntents).toHaveBeenCalledWith(
            client,
            pathParams,
        )
    })

    it('disables query when path params are incomplete', () => {
        useGetArticleTranslationIntents({
            ...pathParams,
            locale: '',
        })

        const queryOptions = mockUseQuery.mock.calls[0][0]
        expect(queryOptions.enabled).toBe(false)
    })

    it('respects overrides enabled flag', () => {
        useGetArticleTranslationIntents(pathParams, { enabled: false })

        const queryOptions = mockUseQuery.mock.calls[0][0]
        expect(queryOptions.enabled).toBe(false)
    })
})
