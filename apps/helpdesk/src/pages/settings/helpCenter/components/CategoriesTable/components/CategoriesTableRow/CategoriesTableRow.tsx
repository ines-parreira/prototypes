import type { MouseEvent, ReactElement } from 'react'
import type React from 'react'
import { useCallback, useMemo, useState } from 'react'

import classNames from 'classnames'
import _keyBy from 'lodash/keyBy'
import _noop from 'lodash/noop'
import { Badge } from 'reactstrap'

import {
    LegacyLoadingSpinner as LoadingSpinner,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useModalManager } from 'hooks/useModalManager'
import type { Article, NonRootCategory } from 'models/helpCenter/types'
import { LanguageList } from 'pages/common/components/LanguageBulletList'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import type { RowEventListeners } from 'pages/settings/helpCenter/components/DroppableTableBodyRow'
import { DroppableTableBodyRow } from 'pages/settings/helpCenter/components/DroppableTableBodyRow'
import { TableActions } from 'pages/settings/helpCenter/components/TableActions'
import type { CategoryRowActionTypes } from 'pages/settings/helpCenter/constants'
import { ARTICLES_PER_PAGE, MODALS } from 'pages/settings/helpCenter/constants'
import { useArticlesActions } from 'pages/settings/helpCenter/hooks/useArticlesActions'
import { useCategoriesActions } from 'pages/settings/helpCenter/hooks/useCategoriesActions'
import { useAbilityChecker } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { getCategoryDndType } from 'pages/settings/helpCenter/utils/getCategoryDndType'
import {
    getArticlesInCategory,
    getUncategorizedArticles,
} from 'state/entities/helpCenter/articles'
import {
    getCategoriesById,
    getNonRootCategoriesById,
} from 'state/entities/helpCenter/categories'
import { changeViewLanguage, getViewLanguage } from 'state/ui/helpCenter'
import { unreachable } from 'utils'

import { useCategoryRowActions } from '../../../../hooks/useCategoryRowActions'
import VisibilityCell from '../../../VisibilityCell/VisibilityCell'
import { CATEGORY_NR_OF_COLUMNS } from '../../constants'

import css from './CategoriesTableRow.less'

export type CategoriesTableRowProps = {
    category: NonRootCategory
    position: number
    categoryId: number | null
    childCategories: number[]
    level: number
    isUnlisted: boolean
    title: string
    renderArticleList: (
        categoryId: number | null,
        articles: Article[],
        level: number,
        isUnlisted: boolean,
    ) => ReactElement
    tooltip?: string
    shouldRenderRowWithoutArticles?: boolean
    onDragStart: (children: number[]) => void
    isCountBadgeLoading: boolean
} & RowEventListeners

type FixedCategoriesTableRowProps = {
    headerCell: ReactElement
    bodyInnerClass: string
}

const FixedCategoriesTableRow = ({
    headerCell,
    bodyInnerClass,
}: FixedCategoriesTableRowProps) => (
    <TableBodyRow className={css.row}>
        <BodyCell>{''}</BodyCell>
        {headerCell}
        <BodyCell innerClassName={bodyInnerClass}>{''}</BodyCell>
        <BodyCell innerClassName={bodyInnerClass}>{''}</BodyCell>
        <BodyCell innerClassName={bodyInnerClass}>{''}</BodyCell>
        <BodyCell width={120} innerClassName={bodyInnerClass}>
            {''}
        </BodyCell>
    </TableBodyRow>
)

type DroppableCategoriesTableRowProps = {
    category: NonRootCategory
    headerCell: ReactElement
    bodyInnerClass: string
    onDragStart: () => void
    onClick: () => void
    position: number
    level: number
    isUnlisted: boolean
} & RowEventListeners

const DroppableCategoriesTableRow = ({
    category,
    headerCell,
    bodyInnerClass,
    onClick,
    onDragStart,
    onMoveEntity,
    onDropEntity,
    onCancelDnD,
    position,
    level,
    isUnlisted,
}: DroppableCategoriesTableRowProps) => {
    const dispatch = useAppDispatch()
    const locales = useSupportedLocales()
    const categoryModal = useModalManager(MODALS.CATEGORY, {
        autoDestroy: false,
    })
    const articleModal = useModalManager(MODALS.ARTICLE, { autoDestroy: false })
    const viewLanguage = useAppSelector(getViewLanguage)
    const { isPassingRulesCheck } = useAbilityChecker()

    const categoryRowActions = useCategoryRowActions(category.id, level)

    const localesByCode = useMemo(() => _keyBy(locales, 'code'), [locales])

    const languageList = useMemo(() => {
        if (category.available_locales.length > 0) {
            return category.available_locales
                .filter((code) => localesByCode[code])
                .map((code) => localesByCode[code])
        }

        return [localesByCode[category.translation.locale]]
    }, [category, localesByCode])

    const handleOnActionClick = useCallback(
        (ev: MouseEvent, name: CategoryRowActionTypes) => {
            switch (name) {
                case 'categorySettings': {
                    if (category.translation.locale !== viewLanguage) {
                        dispatch(
                            changeViewLanguage(category.translation.locale),
                        )
                    }

                    categoryModal.openModal(MODALS.CATEGORY, false, category)
                    return
                }
                case 'createNestedCategory': {
                    categoryModal.openModal(MODALS.CATEGORY, false, {
                        isCreate: true,
                        parentCategoryId: category.id,
                    })
                    return
                }
                case 'createNestedArticle': {
                    articleModal.openModal(MODALS.ARTICLE, false, {
                        categoryId: category.id,
                    })
                    return
                }

                default: {
                    unreachable(name)
                }
            }
        },
        [articleModal, category, categoryModal, dispatch, viewLanguage],
    )

    const canUpdateCategory = isPassingRulesCheck(({ can }) =>
        can('update', 'CategoryEntity'),
    )

    return (
        <DroppableTableBodyRow
            className={css['droppable-row']}
            dragItem={{
                id: category.id,
                position,
                type: getCategoryDndType(
                    category.translation.parent_category_id,
                ),
            }}
            onDragStart={canUpdateCategory ? onDragStart : _noop}
            onMoveEntity={canUpdateCategory ? onMoveEntity : _noop}
            onDropEntity={canUpdateCategory ? onDropEntity : _noop}
            onCancelDnD={canUpdateCategory ? onCancelDnD : _noop}
            category={category}
        >
            {headerCell}
            <BodyCell
                style={{ minWidth: 110, width: 110 }}
                innerClassName={bodyInnerClass}
                onClick={onClick}
            >
                <VisibilityCell
                    status={
                        category.translation.customer_visibility ?? 'PUBLIC'
                    }
                    isParentUnlisted={isUnlisted}
                />
            </BodyCell>
            <BodyCell
                style={{ minWidth: 104, width: 104 }}
                innerClassName={bodyInnerClass}
                onClick={onClick}
            >
                <LanguageList
                    id={category.id}
                    defaultLanguage={localesByCode[category.translation.locale]}
                    languageList={languageList}
                />
            </BodyCell>
            <BodyCell
                style={{ minWidth: 104, width: 104 }}
                innerClassName={bodyInnerClass}
                onClick={onClick}
            >
                {' '}
            </BodyCell>
            <BodyCell
                style={{ minWidth: 120, width: 120 }}
                innerClassName={classNames(css.actions, bodyInnerClass)}
            >
                <TableActions
                    actions={categoryRowActions}
                    onClick={handleOnActionClick}
                />
            </BodyCell>
        </DroppableTableBodyRow>
    )
}

export const CategoriesTableRow = ({
    categoryId,
    childCategories,
    level,
    isUnlisted,
    renderArticleList,
    title = '',
    tooltip,
    shouldRenderRowWithoutArticles = true,
    onDragStart,
    ...props
}: CategoriesTableRowProps): JSX.Element | null => {
    const categories = useAppSelector(getCategoriesById)
    const nonNullCategories = useAppSelector(getNonRootCategoriesById)
    const [isOpen, setOpen] = useState(false)
    const articlesCount = props.category.articleCount
    const { isLoading, fetchArticles } = useArticlesActions()
    const { fetchCategoryArticleCount } = useCategoriesActions()
    const articles = useAppSelector(
        categoryId !== null
            ? getArticlesInCategory(categoryId)
            : getUncategorizedArticles,
    )
    const hasArticles = useMemo(() => articlesCount > 0, [articlesCount])
    const subcategoriesCount = props.category.children.length
    const hasSubcategories = subcategoriesCount > 0
    const viewLanguage = useAppSelector(getViewLanguage) ?? 'en-US'

    const hasMore = useMemo(
        () => articles.length < articlesCount,
        [articles, articlesCount],
    )

    const fetchMore = useCallback(async () => {
        if (hasMore && !isLoading) {
            await fetchArticles(categoryId, {
                page: Math.floor(articles.length / ARTICLES_PER_PAGE) + 1,
                per_page: ARTICLES_PER_PAGE,
            })
        }
    }, [articles, categoryId, hasMore, isLoading, fetchArticles])

    const onLoadMore = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()

            void fetchMore()
        },
        [fetchMore],
    )

    const handleOnDragStart = useCallback(() => {
        const parentCategoryId =
            props.category.translation.parent_category_id || 0
        const defaultChildrenPositions =
            categories[parentCategoryId.toString()].children
        onDragStart(defaultChildrenPositions)
        setOpen(false)
    }, [categories, onDragStart, props.category.translation.parent_category_id])

    const renderContent = () => {
        if (!isOpen) {
            return null
        }

        return (
            <>
                {childCategories.length > 0 && (
                    <TableBodyRow>
                        <BodyCell
                            colSpan={CATEGORY_NR_OF_COLUMNS}
                            className={css['subCategory-cell']}
                        >
                            <TableWrapper
                                className={
                                    css[`subCategory-table-level${level}`]
                                }
                            >
                                <TableBody>
                                    {childCategories.map(
                                        (categoryId, index) => {
                                            const currentCategory =
                                                nonNullCategories[categoryId]
                                            return (
                                                <CategoriesTableRow
                                                    key={categoryId}
                                                    categoryId={categoryId}
                                                    childCategories={
                                                        currentCategory.children
                                                    }
                                                    level={level + 1}
                                                    isUnlisted={
                                                        isUnlisted ||
                                                        currentCategory
                                                            .translation
                                                            .customer_visibility ===
                                                            'UNLISTED'
                                                    }
                                                    category={currentCategory}
                                                    position={index}
                                                    title={
                                                        currentCategory
                                                            .translation.title
                                                    }
                                                    renderArticleList={
                                                        renderArticleList
                                                    }
                                                    onMoveEntity={
                                                        props.onMoveEntity
                                                    }
                                                    onDropEntity={
                                                        props.onDropEntity
                                                    }
                                                    onCancelDnD={
                                                        props.onCancelDnD
                                                    }
                                                    onDragStart={onDragStart}
                                                    isCountBadgeLoading={
                                                        props.isCountBadgeLoading
                                                    }
                                                />
                                            )
                                        },
                                    )}
                                </TableBody>
                            </TableWrapper>
                        </BodyCell>
                    </TableBodyRow>
                )}
                {articles.length > 0 && (
                    <TableBodyRow>
                        <BodyCell
                            colSpan={CATEGORY_NR_OF_COLUMNS}
                            className={css['parent-cell']}
                        >
                            {renderArticleList(
                                categoryId,
                                articles,
                                level,
                                isUnlisted,
                            )}
                        </BodyCell>
                    </TableBodyRow>
                )}
                {hasMore && (
                    <TableBodyRow>
                        <BodyCell
                            colSpan={CATEGORY_NR_OF_COLUMNS}
                            innerClassName={classNames(
                                css['no-click'],
                                css['load-more'],
                            )}
                        >
                            {isLoading ? (
                                <LoadingSpinner size="small" />
                            ) : (
                                <a href="" onClick={onLoadMore}>
                                    Load more
                                </a>
                            )}
                        </BodyCell>
                    </TableBodyRow>
                )}
            </>
        )
    }

    const id = `category-title-${categoryId ?? 'uncategorized'}`
    const caret =
        hasArticles || hasSubcategories ? (
            <span className={classNames(css.caret, 'material-icons')}>
                {isOpen ? 'arrow_drop_down' : 'arrow_right'}
            </span>
        ) : (
            <span className={css['caret-placeholder']} />
        )
    const countBadge = props.isCountBadgeLoading ? (
        <LoadingSpinner size="small" style={{ marginLeft: 8 }} />
    ) : (
        <Badge pill color="light" className={css.count}>
            {hasArticles || hasSubcategories
                ? articlesCount + subcategoriesCount
                : 'No Published Articles'}
        </Badge>
    )
    const bodyInnerClass = classNames({ [css['no-click']]: !hasArticles })
    const handleOnClick = useCallback(() => {
        if (hasArticles || hasSubcategories) {
            const nextIsOpen = !isOpen

            if (hasArticles && articles.length === 0) {
                void fetchMore()
            }

            if (nextIsOpen) {
                void fetchCategoryArticleCount(categoryId, viewLanguage)
            }

            setOpen(nextIsOpen)
        }
    }, [
        hasArticles,
        hasSubcategories,
        isOpen,
        fetchCategoryArticleCount,
        categoryId,
        viewLanguage,
        fetchMore,
        articles.length,
    ])

    const headerCell = (
        <BodyCell
            className={css['cell']}
            innerClassName={bodyInnerClass}
            onClick={handleOnClick}
        >
            {caret}
            <span
                id={id}
                className={classNames({
                    [css['tooltip-underline']]: tooltip,
                })}
            >
                {title}
            </span>
            {tooltip && (
                <Tooltip
                    target={id}
                    placement="bottom-start"
                    innerProps={{
                        style: {
                            textAlign: 'left',
                            width: 180,
                        },
                    }}
                >
                    {tooltip}
                </Tooltip>
            )}
            {countBadge}
        </BodyCell>
    )

    if (!shouldRenderRowWithoutArticles && !hasArticles) {
        return null
    }

    return (
        <>
            {'category' in props ? (
                <DroppableCategoriesTableRow
                    headerCell={headerCell}
                    bodyInnerClass={bodyInnerClass}
                    onDragStart={handleOnDragStart}
                    onClick={handleOnClick}
                    level={level}
                    isUnlisted={isUnlisted}
                    {...props}
                />
            ) : (
                <FixedCategoriesTableRow
                    headerCell={headerCell}
                    bodyInnerClass={bodyInnerClass}
                />
            )}
            {renderContent()}
        </>
    )
}
