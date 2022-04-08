import React, {
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import classNames from 'classnames'
import {usePrevious} from 'react-use'
import {Badge, Spinner} from 'reactstrap'

import useAppSelector from 'hooks/useAppSelector'
import {Article} from 'models/helpCenter/types'
import {getUncategorizedArticles} from 'state/entities/helpCenter/articles'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import Tooltip from 'pages/common/components/Tooltip'
import {useArticlesActions} from 'pages/settings/helpCenter/hooks/useArticlesActions'
import {ARTICLES_PER_PAGE} from 'pages/settings/helpCenter/constants'

import css from './CategoriesTableBasicRow.less'

export type BaseCategoriesTableRowProps = {
    title?: string
    renderArticleList: (
        categoryId: number | null,
        articles: Article[],
        level: number
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

export const CategoriesTableBasicRow = ({
    renderArticleList,
    title = '',
    tooltip,
    shouldRenderRowWithoutArticles = true,
}: BaseCategoriesTableRowProps): JSX.Element | null => {
    const [isOpen, setOpen] = useState(false)
    const [itemCount, setItemCount] = useState(0)
    const {isLoading, fetchArticles, getArticleCount} = useArticlesActions()
    const articles = useAppSelector(getUncategorizedArticles)
    const hasArticles = useMemo(() => itemCount > 0, [itemCount])
    const prevArticles = usePrevious(articles)
    const hasMore = useMemo(
        () => articles.length < itemCount,
        [articles, itemCount]
    )

    const fetchMore = useCallback(async () => {
        if (hasMore && !isLoading) {
            const {meta} = await fetchArticles(null, {
                page: Math.floor(articles.length / ARTICLES_PER_PAGE) + 1,
                per_page: ARTICLES_PER_PAGE,
            })

            setItemCount(meta.item_count)
        }
    }, [articles, hasMore, isLoading, fetchArticles])

    const onLoadMore = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()

            void fetchMore()
        },
        [fetchMore]
    )

    const renderContent = () => {
        if (!isOpen) {
            return null
        }

        return (
            <>
                {articles.length > 0 && (
                    <TableBodyRow>
                        <BodyCell colSpan={4} className={css['parent-cell']}>
                            {renderArticleList(null, articles, -1)}
                        </BodyCell>
                    </TableBodyRow>
                )}
                {hasMore && (
                    <TableBodyRow>
                        <BodyCell
                            colSpan={4}
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
            const count = await getArticleCount(null)

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
                const {meta} = await fetchArticles(null, params)

                setItemCount(meta.item_count)
            }
        }

        void refetch()
    }, [prevArticles, articles, itemCount, isLoading, fetchArticles])

    useEffect(() => {
        // On category open, fetch articles if category has some and no articles
        // are currently displayed
        if (isOpen && hasArticles && articles.length === 0) {
            void fetchMore()
        }
    }, [isOpen, hasArticles, articles])

    const id = `category-title-uncategorized`
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
            data-testid="openCaret"
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
            <FixedCategoriesTableRow
                headerCell={headerCell}
                bodyInnerClass={bodyInnerClass}
            />
            {renderContent()}
        </>
    )
}
