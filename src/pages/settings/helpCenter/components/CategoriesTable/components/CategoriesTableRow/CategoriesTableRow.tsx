import React, {
    MouseEvent,
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import classNames from 'classnames'
import _keyBy from 'lodash/keyBy'
import {usePrevious} from 'react-use'
import {Badge, Spinner} from 'reactstrap'

import {useModalManager} from 'hooks/useModalManager'
import {Article, NonRootCategory} from 'models/helpCenter/types'
import {
    getArticlesInCategory,
    getUncategorizedArticles,
} from 'state/entities/helpCenter/articles'
import {LanguageList} from 'pages/common/components/LanguageBulletList'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import Tooltip from 'pages/common/components/Tooltip'
import {
    ARTICLES_PER_PAGE,
    CategoryRowActionTypes,
    CATEGORY_ROW_ACTIONS,
    MODALS,
} from 'pages/settings/helpCenter/constants'
import {useArticlesActions} from 'pages/settings/helpCenter/hooks/useArticlesActions'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {
    DroppableTableBodyRow,
    RowEventListeners,
} from 'pages/settings/helpCenter/components/DroppableTableBodyRow'
import {TableActions} from 'pages/settings/helpCenter/components/TableActions'
import useAppSelector from 'hooks/useAppSelector'
import {unreachable} from 'utils'

import {
    getCategoriesById,
    getNonRootCategoriesById,
} from 'state/entities/helpCenter/categories'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import {getCategoryDndType} from 'pages/settings/helpCenter/utils/getCategoryDndType'
import VisibilityCell from '../../../VisibilityCell/VisibilityCell'

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
        isUnlisted: boolean
    ) => ReactElement
    tooltip?: string
    shouldRenderRowWithoutArticles?: boolean
    onDragStart: (children: number[]) => void
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
    position: number
    level: number
    isUnlisted: boolean
} & RowEventListeners

const DroppableCategoriesTableRow = ({
    category,
    headerCell,
    bodyInnerClass,
    onDragStart,
    onMoveEntity,
    onDropEntity,
    onCancelDnD,
    position,
    level,
    isUnlisted,
}: DroppableCategoriesTableRowProps) => {
    const locales = useSupportedLocales()
    const categoryModal = useModalManager(MODALS.CATEGORY, {autoDestroy: false})
    const articleModal = useModalManager(MODALS.ARTICLE, {autoDestroy: false})

    const localesByCode = useMemo(() => _keyBy(locales, 'code'), [locales])

    // FIXME: the form language selector is broken for this case
    // cf. https://linear.app/gorgias/issue/SS-1019/cms-the-language-selector-is-broken-when-creating-an-article-inside-a

    const languageList = useMemo(() => {
        if (category.available_locales.length > 0) {
            return category.available_locales.map((code) => localesByCode[code])
        }

        return [localesByCode[category.translation.locale]]
    }, [category, localesByCode])

    const handleOnActionClick = useCallback(
        (ev: MouseEvent, name: CategoryRowActionTypes) => {
            switch (name) {
                case 'categorySettings': {
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

            // FIXME: the form language selector is broken for this case
            // cf. https://linear.app/gorgias/issue/SS-1019/cms-the-language-selector-is-broken-when-creating-an-article-inside-a
        },
        [articleModal, category, categoryModal]
    )

    return (
        <DroppableTableBodyRow
            className={css['droppable-row']}
            dragItem={{
                id: category.id,
                position,
                type: getCategoryDndType(
                    category.translation.parent_category_id
                ),
            }}
            onDragStart={onDragStart}
            onMoveEntity={onMoveEntity}
            onDropEntity={onDropEntity}
            onCancelDnD={onCancelDnD}
            category={category}
        >
            {headerCell}
            <BodyCell
                style={{minWidth: 110, width: 110}}
                innerClassName={bodyInnerClass}
            >
                <VisibilityCell
                    status={category.translation.visibility_status}
                    isParentUnlisted={isUnlisted}
                />
            </BodyCell>
            <BodyCell
                style={{minWidth: 104, width: 104}}
                innerClassName={bodyInnerClass}
            >
                <LanguageList
                    id={category.id}
                    defaultLanguage={localesByCode[category.translation.locale]}
                    languageList={languageList}
                />
            </BodyCell>
            <BodyCell
                style={{minWidth: 120, width: 120}}
                innerClassName={classNames(css.actions, bodyInnerClass)}
            >
                <TableActions
                    actions={CATEGORY_ROW_ACTIONS.map(
                        ({name, icon, tooltip}) => ({
                            name,
                            icon,
                            disabled:
                                level >= 3 && name === 'createNestedCategory',
                            tooltip: {
                                content: tooltip,
                                target: `${name}-${category.id}`,
                            },
                        })
                    )}
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
    const [itemCount, setItemCount] = useState(0)
    const {isLoading, fetchArticles, getArticleCount} = useArticlesActions()
    const articles = useAppSelector(
        categoryId !== null
            ? getArticlesInCategory(categoryId)
            : getUncategorizedArticles
    )
    const hasArticles = useMemo(() => itemCount > 0, [itemCount])
    const subcategoriesCount = props.category.children.length
    const hasSubcategories = subcategoriesCount > 0

    const hasMore = useMemo(
        () => articles.length < itemCount,
        [articles, itemCount]
    )
    const prevArticles = usePrevious(articles)

    const fetchMore = useCallback(async () => {
        if (hasMore && !isLoading) {
            const {meta} = await fetchArticles(categoryId, {
                page: Math.floor(articles.length / ARTICLES_PER_PAGE) + 1,
                per_page: ARTICLES_PER_PAGE,
            })

            setItemCount(meta.item_count)
        }
    }, [articles, categoryId, hasMore, isLoading, fetchArticles])

    const onLoadMore = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()

            void fetchMore()
        },
        [fetchMore]
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
                            colSpan={5}
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
                                                            .visibility_status ===
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
                                                />
                                            )
                                        }
                                    )}
                                </TableBody>
                            </TableWrapper>
                        </BodyCell>
                    </TableBodyRow>
                )}
                {articles.length > 0 && (
                    <TableBodyRow>
                        <BodyCell colSpan={5} className={css['parent-cell']}>
                            {renderArticleList(
                                categoryId,
                                articles,
                                level,
                                isUnlisted
                            )}
                        </BodyCell>
                    </TableBodyRow>
                )}
                {hasMore && (
                    <TableBodyRow>
                        <BodyCell
                            colSpan={5}
                            innerClassName={classNames(
                                css['no-click'],
                                css['load-more']
                            )}
                        >
                            {isLoading ? (
                                <Spinner size="sm" color="secondary" />
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

    useEffect(() => {
        async function init() {
            const count = await getArticleCount(categoryId)

            setItemCount(count)
        }

        void init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        async function refetch() {
            if (typeof prevArticles === 'undefined' || isLoading) return

            // If articles length changed, refresh the list
            if (prevArticles.length !== articles.length) {
                // If an article was added, fetch all articles to make sure to
                // display it; else, refetch as many articles as previously
                const perPage =
                    articles.length > prevArticles.length
                        ? itemCount + 1
                        : articles.length
                const params = {
                    page: 1,
                    per_page: perPage,
                }

                const {meta} = await fetchArticles(categoryId, params)

                setItemCount(meta.item_count)
            }
        }

        void refetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prevArticles, articles, categoryId, itemCount])

    useEffect(() => {
        // On category open, fetch articles if category has some and no articles
        // are currently displayed
        if (isOpen && hasArticles && articles.length === 0) {
            void fetchMore()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, hasArticles, articles])

    const id = `category-title-${categoryId ?? 'uncategorized'}`
    const caret =
        hasArticles || hasSubcategories ? (
            <span className={classNames(css.caret, 'material-icons')}>
                {isOpen ? 'arrow_drop_down' : 'arrow_right'}
            </span>
        ) : (
            <span className={css['caret-placeholder']} />
        )
    const countBadge =
        isLoading && !hasArticles && !hasSubcategories ? (
            <Spinner size="sm" color="secondary" style={{marginLeft: 8}} />
        ) : (
            <Badge pill color="light" className={css.count}>
                {hasArticles || hasSubcategories
                    ? itemCount + subcategoriesCount
                    : 'No Published Articles'}
            </Badge>
        )
    const bodyInnerClass = classNames({[css['no-click']]: !hasArticles})
    const headerCell = (
        <BodyCell
            className={css['cell']}
            innerClassName={bodyInnerClass}
            onClick={() => {
                if (hasArticles || hasSubcategories) {
                    setOpen(!isOpen)
                }
            }}
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
                    style={{
                        textAlign: 'left',
                        width: 180,
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
