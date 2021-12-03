import React, {
    MouseEvent,
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import classNames from 'classnames'
import {useSelector} from 'react-redux'
import {usePrevious} from 'react-use'
import {Badge, Spinner} from 'reactstrap'

import {useModalManager} from '../../../../../../../hooks/useModalManager'
import {Article, Category} from '../../../../../../../models/helpCenter/types'
import {
    getArticlesInCategory,
    getUncategorizedArticles,
} from '../../../../../../../state/helpCenter/articles'
import {LanguageList} from '../../../../../../common/components/LanguageBulletList'
import BodyCell from '../../../../../../common/components/table/cells/BodyCell'
import TableBodyRow from '../../../../../../common/components/table/TableBodyRow'
import Tooltip from '../../../../../../common/components/Tooltip'
import {
    ARTICLES_PER_PAGE,
    CATEGORY_ROW_ACTIONS,
    MODALS,
} from '../../../../constants'
import {useArticlesActions} from '../../../../hooks/useArticlesActions'
import {useSupportedLocales} from '../../../../providers/SupportedLocales'
import {
    DroppableTableBodyRow,
    RowEventListeners,
} from '../../../DroppableTableBodyRow'
import {TableActions} from '../../../TableActions'
import {DND_ENTITIES} from '../../constants'

import css from './CategoriesTableRow.less'

export type CategoriesTableRowProps =
    | BaseCategoriesTableRowProps
    | ({category: Category; position: number} & BaseCategoriesTableRowProps &
          RowEventListeners)

type BaseCategoriesTableRowProps = {
    categoryId: number | null
    title: string
    renderArticleList: (
        categoryId: number | null,
        articles: Article[]
    ) => ReactElement
    tooltip?: string
    shouldRenderRowWithoutArticles?: boolean
}

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
    category: Category
    headerCell: ReactElement
    bodyInnerClass: string
    onDragStart: () => void
    position: number
} & RowEventListeners

const DroppableCategoriesTableRow = ({
    category,
    headerCell,
    bodyInnerClass,
    onDragStart,
    onMoveEntity,
    onDropEntity,
    position,
}: DroppableCategoriesTableRowProps) => {
    const categoryModal = useModalManager(MODALS.CATEGORY, {autoDestroy: false})
    const localesByCode = useSupportedLocales()

    // FIXME: the form language selector is broken for this case
    // cf. https://linear.app/gorgias/issue/SS-1019/cms-the-language-selector-is-broken-when-creating-an-article-inside-a

    const languageList = useMemo(() => {
        if (category.available_locales.length > 0) {
            return category.available_locales.map((code) => localesByCode[code])
        }

        return [localesByCode[category.translation.locale]]
    }, [category, localesByCode])

    const handleOnActionClick = (ev: MouseEvent, name: string) => {
        if (!category) return

        if (name === 'categorySettings') {
            categoryModal.openModal(MODALS.CATEGORY, false, category)
            return
        }

        // FIXME: the form language selector is broken for this case
        // cf. https://linear.app/gorgias/issue/SS-1019/cms-the-language-selector-is-broken-when-creating-an-article-inside-a
    }

    return (
        <DroppableTableBodyRow
            className={css['droppable-row']}
            dragItem={{
                id: category.id,
                position,
                type: DND_ENTITIES.CATEGORY,
            }}
            onDragStart={onDragStart}
            onMoveEntity={onMoveEntity}
            onDropEntity={onDropEntity}
        >
            {headerCell}
            <BodyCell innerClassName={bodyInnerClass}>
                {category.translation && (
                    <LanguageList
                        id={category.id}
                        defaultLanguage={
                            localesByCode[category.translation.locale]
                        }
                        languageList={languageList}
                    />
                )}
            </BodyCell>
            <BodyCell
                width={120}
                innerClassName={classNames(css.actions, bodyInnerClass)}
            >
                <TableActions
                    actions={CATEGORY_ROW_ACTIONS.map(
                        ({name, icon, tooltip}) => ({
                            name,
                            icon,
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
    renderArticleList,
    title,
    tooltip,
    shouldRenderRowWithoutArticles = true,
    ...props
}: CategoriesTableRowProps): JSX.Element | null => {
    const [isOpen, setOpen] = useState(false)
    const [itemCount, setItemCount] = useState(0)
    const {isLoading, fetchArticles, getArticleCount} = useArticlesActions()
    const articles = useSelector(
        categoryId !== null
            ? getArticlesInCategory(categoryId)
            : getUncategorizedArticles
    )
    const hasArticles = useMemo(() => itemCount > 0, [itemCount])
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

    const onLoadMore = (e: React.MouseEvent) => {
        e.preventDefault()

        void fetchMore()
    }

    const renderContent = () => {
        if (!isOpen) {
            return null
        }

        return (
            <>
                {articles.length > 0 && (
                    <TableBodyRow>
                        <BodyCell colSpan={4} className={css['parent-cell']}>
                            {renderArticleList(categoryId, articles)}
                        </BodyCell>
                    </TableBodyRow>
                )}
                {hasMore && (
                    <TableBodyRow>
                        <BodyCell
                            colSpan={4}
                            className={css['parent-cell']}
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
    }, [prevArticles, articles, categoryId, itemCount])

    useEffect(() => {
        // On category open, fetch articles if category has some and no articles
        // are currently displayed
        if (isOpen && hasArticles && articles.length === 0) {
            void fetchMore()
        }
    }, [isOpen, hasArticles, articles])

    const id = `category-title-${categoryId ?? 'uncategorized'}`
    const caret = hasArticles ? (
        <span className={classNames(css.caret, 'material-icons')}>
            {isOpen ? 'arrow_drop_down' : 'arrow_right'}
        </span>
    ) : (
        <span className={css['caret-placeholder']} />
    )
    const countBadge =
        isLoading && !hasArticles ? (
            <Spinner size="sm" color="secondary" style={{marginLeft: 8}} />
        ) : (
            <Badge pill color="light" className={css.count}>
                {hasArticles ? itemCount : 'No Published Articles'}
            </Badge>
        )
    const bodyInnerClass = classNames({[css['no-click']]: !hasArticles})
    const headerCell = (
        <BodyCell
            className={css['cell']}
            innerClassName={bodyInnerClass}
            onClick={() => hasArticles && setOpen(!isOpen)}
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
                    onDragStart={() => setOpen(false)}
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
