import React, {
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import classNames from 'classnames'
import {Badge, Spinner} from 'reactstrap'
import {Tooltip} from '@gorgias/ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import {Article} from 'models/helpCenter/types'
import {getUncategorizedArticles} from 'state/entities/helpCenter/articles'
import {getRootCategory} from 'state/entities/helpCenter/categories'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import {useArticlesActions} from 'pages/settings/helpCenter/hooks/useArticlesActions'
import {ARTICLES_PER_PAGE} from 'pages/settings/helpCenter/constants'

import {CATEGORY_NR_OF_COLUMNS} from '../../constants'
import css from './CategoriesTableBasicRow.less'

export type BaseCategoriesTableRowProps = {
    title?: string
    renderArticleList: (
        categoryId: number | null,
        articles: Article[],
        level: number,
        isUnlisted: boolean
    ) => ReactElement
    tooltip?: string
    shouldRenderRowWithoutArticles?: boolean
    isCountBadgeLoading: boolean
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
        <BodyCell width={104} innerClassName={bodyInnerClass}>
            {''}
        </BodyCell>
        <BodyCell width={104} innerClassName={bodyInnerClass}>
            {''}
        </BodyCell>
        <BodyCell width={146} innerClassName={bodyInnerClass}>
            {''}
        </BodyCell>
    </TableBodyRow>
)

export const CategoriesTableBasicRow = ({
    renderArticleList,
    title = '',
    tooltip,
    shouldRenderRowWithoutArticles = true,
    isCountBadgeLoading,
}: BaseCategoriesTableRowProps): JSX.Element | null => {
    const [isOpen, setOpen] = useState(false)

    const itemCount = useAppSelector(getRootCategory).articleCount

    const {isLoading, fetchArticles} = useArticlesActions()
    const articles = useAppSelector(getUncategorizedArticles)
    const hasArticles = useMemo(() => itemCount > 0, [itemCount])
    const hasMore = useMemo(
        () => articles.length < itemCount,
        [articles, itemCount]
    )

    const fetchMore = useCallback(async () => {
        if (hasMore && !isLoading) {
            await fetchArticles(null, {
                page: Math.floor(articles.length / ARTICLES_PER_PAGE) + 1,
                per_page: ARTICLES_PER_PAGE,
            })
        }
    }, [hasMore, isLoading, fetchArticles, articles.length])

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
                        <BodyCell
                            colSpan={CATEGORY_NR_OF_COLUMNS}
                            className={css['parent-cell']}
                        >
                            {renderArticleList(null, articles, -1, false)}
                        </BodyCell>
                    </TableBodyRow>
                )}
                {hasMore && (
                    <TableBodyRow>
                        <BodyCell
                            colSpan={CATEGORY_NR_OF_COLUMNS}
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
        // On category open, fetch articles if category has some and no articles
        // are currently displayed
        if (isOpen && hasArticles && articles.length === 0) {
            void fetchMore()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, hasArticles, articles])

    const id = `category-title-uncategorized`
    const caret = hasArticles ? (
        <span className={classNames(css.caret, 'material-icons')}>
            {isOpen ? 'arrow_drop_down' : 'arrow_right'}
        </span>
    ) : (
        <span className={css['caret-placeholder']} />
    )
    const countBadge = isCountBadgeLoading ? (
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
            <FixedCategoriesTableRow
                headerCell={headerCell}
                bodyInnerClass={bodyInnerClass}
            />
            {renderContent()}
        </>
    )
}
