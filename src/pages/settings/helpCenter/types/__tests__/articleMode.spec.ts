import {CreateArticleDto} from 'models/helpCenter/types'

import {
    ArticleModeModified,
    ArticleModeNew,
    ArticleModeUnchangedNotPublished,
    ArticleModeUnchangedPublished,
    canDelete,
    getArticleMode,
} from '../articleMode'

const mockedUpdateArticle = jest.fn()
const mockedDeleteArticle = jest.fn()
const mockedCreateArticle = jest.fn()

describe('articleMode', () => {
    const handlers = {
        updateArticle: mockedUpdateArticle,
        deleteArticle: mockedDeleteArticle,
        createArticle: mockedCreateArticle,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('canDelete', () => {
        it('if article is not new', () => {
            expect(
                canDelete({
                    mode: 'modified',
                    onDelete: mockedDeleteArticle,
                    onSave: mockedUpdateArticle,
                })
            ).toEqual(true)

            expect(
                canDelete({
                    mode: 'unchanged_not_published',
                    onDelete: mockedDeleteArticle,
                    onPublish: jest.fn(),
                })
            ).toEqual(true)

            expect(
                canDelete({
                    mode: 'unchanged_published',
                    onDelete: mockedDeleteArticle,
                })
            ).toEqual(true)
        })

        it('if article is new', () => {
            expect(
                canDelete({
                    mode: 'new',
                    onCreate: mockedCreateArticle,
                })
            ).toEqual(false)
        })
    })

    describe('getArticleMode', () => {
        const newTranslationData: CreateArticleDto['translation'] = {
            content: 'I am the content',
            excerpt: 'I am the...',
            is_current: false,
            locale: 'en-US',
            seo_meta: {
                description: null,
                title: null,
            },
            slug: 'i-am-the-title',
            title: 'I am the title',
        }

        const existingArticleData = {
            id: 42,
            created_datetime: '2017-07-01T18:00:00',
            updated_datetime: '2017-07-01T18:00:00',
            help_center_id: 10,
            available_locales: ['en-US', 'fr-FR'],
            rating: {
                up: 25,
                down: 2,
            },
        }

        const existingTranslationData = {
            ...newTranslationData,
            created_datetime: '2017-07-01T18:05:30',
            updated_datetime: '2017-07-01T18:05:30',
            article_id: existingArticleData.id,
            rating: existingArticleData.rating,
        }

        it('returns new if article is new', async () => {
            const modeNew = getArticleMode(
                {
                    translation: newTranslationData,
                },
                false,
                handlers
            ) as ArticleModeNew

            expect(modeNew.mode).toEqual('new')

            await modeNew.onCreate(true)

            expect(mockedCreateArticle).toHaveBeenLastCalledWith(
                {
                    translation: newTranslationData,
                },
                true
            )

            await modeNew.onCreate(false)

            expect(mockedCreateArticle).toHaveBeenLastCalledWith(
                {
                    translation: newTranslationData,
                },
                false
            )
        })

        it('returns new if article translation is new', async () => {
            const modeNew = getArticleMode(
                {
                    ...existingArticleData,
                    translation: newTranslationData,
                },
                false,
                handlers
            ) as ArticleModeNew

            expect(modeNew.mode).toEqual('new')

            await modeNew.onCreate(true)

            expect(mockedUpdateArticle).toHaveBeenLastCalledWith(
                {
                    ...existingArticleData,
                    translation: newTranslationData,
                },
                true
            )

            await modeNew.onCreate(false)

            expect(mockedUpdateArticle).toHaveBeenLastCalledWith(
                {
                    ...existingArticleData,
                    translation: newTranslationData,
                },
                false
            )
        })

        it('returns unchanged_not_published if article is unchanged and not yet published', async () => {
            const modeUnchangedNotPublished = getArticleMode(
                {
                    ...existingArticleData,
                    translation: existingTranslationData,
                },
                false,
                handlers
            ) as ArticleModeUnchangedNotPublished

            expect(modeUnchangedNotPublished.mode).toEqual(
                'unchanged_not_published'
            )

            await modeUnchangedNotPublished.onPublish()

            expect(mockedUpdateArticle).toHaveBeenLastCalledWith(
                {
                    ...existingArticleData,
                    translation: existingTranslationData,
                },
                true
            )

            await modeUnchangedNotPublished.onDelete()

            expect(mockedDeleteArticle).toHaveBeenCalledTimes(1)
        })

        it('returns modified if article was modified', async () => {
            const modeModified = getArticleMode(
                {
                    ...existingArticleData,
                    translation: existingTranslationData,
                },
                true,
                handlers
            ) as ArticleModeModified

            expect(modeModified.mode).toEqual('modified')

            await modeModified.onSave(true)

            expect(mockedUpdateArticle).toHaveBeenLastCalledWith(
                {
                    ...existingArticleData,
                    translation: existingTranslationData,
                },
                true
            )

            await modeModified.onSave(false)

            expect(mockedUpdateArticle).toHaveBeenLastCalledWith(
                {
                    ...existingArticleData,
                    translation: existingTranslationData,
                },
                false
            )

            await modeModified.onDelete()

            expect(mockedDeleteArticle).toHaveBeenCalledTimes(1)
        })

        it('returns unchanged_published if article was not modified and already published', async () => {
            const modeUnchangedPublished = getArticleMode(
                {
                    ...existingArticleData,
                    translation: {...existingTranslationData, is_current: true},
                },
                false,
                handlers
            ) as ArticleModeUnchangedPublished

            expect(modeUnchangedPublished.mode).toEqual('unchanged_published')

            await modeUnchangedPublished.onDelete()

            expect(mockedDeleteArticle).toHaveBeenCalledTimes(1)
        })
    })
})
