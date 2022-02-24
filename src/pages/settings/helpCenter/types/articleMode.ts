import {Article, CreateArticleDto} from 'models/helpCenter/types'
import {
    isExistingArticle,
    isExistingTranslation,
    isNotPublished,
} from '../utils/helpCenter.utils'

export interface ArticleModeNew {
    mode: 'new'
    onCreate: (isPublished: boolean) => Promise<void>
}

export interface ArticleModeUnchangedPublished {
    mode: 'unchanged_published'
    onDelete: () => Promise<void>
}

export interface ArticleModeModified {
    mode: 'modified'
    onSave: (isPublished: boolean) => Promise<void>
    onDelete: () => Promise<void>
}

export interface ArticleModeUnchangedNotPublished {
    mode: 'unchanged_not_published'
    onPublish: () => Promise<void>
    onDelete: () => Promise<void>
}

export type ArticleMode =
    | ArticleModeNew
    | ArticleModeUnchangedPublished
    | ArticleModeModified
    | ArticleModeUnchangedNotPublished

export const canDelete = (
    mode: ArticleMode
): mode is
    | ArticleModeUnchangedPublished
    | ArticleModeModified
    | ArticleModeUnchangedNotPublished => 'onDelete' in mode

export const getArticleMode = (
    article: CreateArticleDto | Article | null,
    modified: boolean,
    handlers: {
        createArticle: (
            article: CreateArticleDto | Article | null,
            isPublished: boolean
        ) => Promise<void>
        deleteArticle: () => Promise<void>
        updateArticle: (
            article: Article | null,
            isPublished: boolean
        ) => Promise<void>
    }
): ArticleMode => {
    const {createArticle, deleteArticle, updateArticle} = handlers

    if (!isExistingArticle(article)) {
        return {
            mode: 'new',
            onCreate: (isPublished: boolean) =>
                createArticle(article, isPublished),
        }
    }

    if (!isExistingTranslation(article.translation)) {
        // we UPDATE an existing article with a NEW translation
        return {
            mode: 'new',
            onCreate: (isPublished: boolean) =>
                updateArticle(article, isPublished),
        }
    }

    if (isNotPublished(article) && !modified) {
        return {
            mode: 'unchanged_not_published',
            onPublish: () => updateArticle(article, true),
            onDelete: deleteArticle,
        }
    }

    if (modified) {
        return {
            mode: 'modified',
            onSave: (isPublished: boolean) =>
                updateArticle(article, isPublished),
            onDelete: deleteArticle,
        }
    }

    return {
        mode: 'unchanged_published',
        onDelete: deleteArticle,
    }
}
