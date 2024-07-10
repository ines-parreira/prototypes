import React from 'react'
import Skeleton from 'react-loading-skeleton'
import {Tooltip} from '@gorgias/ui-kit'
import cn from 'classnames'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {NumberedPagination} from 'pages/common/components/Paginations'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {AIArticleRecommendationItem} from '../hooks/useAIArticleRecommendationItems'
import {AllRecomendationsColumn} from './AutomateAllRecommendationsCard'
import css from './AutomateAllRecommendationsTable.less'

const DEFAULT_COLUMN_WIDTH = 224

type AutomateAllRecommendationTableProps = {
    isLoading?: boolean
    columns: AllRecomendationsColumn[]
    articles: AIArticleRecommendationItem[]
    pageSize?: number
    currentPage: number
    pagesCount: number
    onPageChange: (page: number) => void
}

const ArchiveBadge = () => (
    <>
        <Badge id="archive-badge" type={ColorType.LightYellow}>
            ARCHIVED
        </Badge>
        <Tooltip
            placement="top"
            target="archive-badge"
            trigger={['hover']}
            autohide={false}
        >
            {'Recommendation archived from your Help Center’s AI Library'}
        </Tooltip>
    </>
)

const ArticleTitle = ({
    title,
    reviewAction,
}: Pick<AIArticleRecommendationItem, 'reviewAction' | 'title'>) => (
    <>
        <span className={css.textTruncate}>{title}</span>
        {reviewAction && reviewAction === 'archive' && <ArchiveBadge />}
        {reviewAction && reviewAction === 'publish' && (
            <i className={cn('material-icons', css.publishedArticle)}>
                open_in_new
            </i>
        )}
    </>
)

const ArticleStatus = ({
    reviewAction,
}: Pick<AIArticleRecommendationItem, 'reviewAction'>) =>
    reviewAction === 'publish' || reviewAction === 'saveAsDraft' ? (
        <span className={css.articleStatusWithIcon}>
            <i className="material-icons">check_circle</i>
            {' Created'}
        </span>
    ) : (
        <span className={css.articleStatus}>Create Article</span>
    )

const AutomateAllRecommendationsTable = ({
    isLoading,
    columns,
    articles,
    pageSize,
    currentPage,
    pagesCount,
    onPageChange,
}: AutomateAllRecommendationTableProps) => {
    const tableWidth = columns.map((column) => column.width)
    return (
        <>
            <div className={css.container}>
                <TableWrapper className={css.table}>
                    <TableHead>
                        {columns.map((column, index) => (
                            <HeaderCellProperty
                                key={column.name}
                                title={column.name}
                                width={
                                    tableWidth[index] ?? DEFAULT_COLUMN_WIDTH
                                }
                                justifyContent={index === 2 ? 'right' : 'left'}
                                wrapContent
                                className={css.headerCellProperty}
                                tooltip={
                                    column.tooltip
                                        ? column.tooltip.title
                                        : undefined
                                }
                            />
                        ))}
                    </TableHead>

                    <TableBody>
                        {isLoading
                            ? Array(pageSize)
                                  .fill(null)
                                  .map((_, index) => (
                                      <TableBodyRow
                                          key={index}
                                          className={css.tableBodyRow}
                                      >
                                          {columns.map((_, index) => (
                                              <BodyCell
                                                  key={index}
                                                  width={
                                                      tableWidth[index] ??
                                                      DEFAULT_COLUMN_WIDTH
                                                  }
                                                  className={css.bodyCell}
                                                  innerClassName={
                                                      css.bodyCellContent
                                                  }
                                              >
                                                  <div className={css.loader}>
                                                      <Skeleton height={20} />
                                                  </div>
                                              </BodyCell>
                                          ))}
                                      </TableBodyRow>
                                  ))
                            : articles.map((article, rowNumber) => (
                                  <TableBodyRow
                                      key={rowNumber}
                                      className={css.tableBodyRow}
                                  >
                                      <BodyCell
                                          key={`title-${rowNumber}`}
                                          className={css.bodyCell}
                                          innerClassName={css.bodyCellContent}
                                          justifyContent="left"
                                          width={tableWidth[0]}
                                      >
                                          <ArticleTitle
                                              title={article.title}
                                              reviewAction={
                                                  article.reviewAction
                                              }
                                          />
                                      </BodyCell>
                                      <BodyCell
                                          key={`ticketsCount-${rowNumber}`}
                                          className={css.bodyCell}
                                          innerClassName={css.bodyCellContent}
                                          justifyContent="left"
                                          width={DEFAULT_COLUMN_WIDTH}
                                      >
                                          {article.ticketsCount}
                                      </BodyCell>
                                      <BodyCell
                                          key={`status-${rowNumber}`}
                                          className={css.bodyCell}
                                          innerClassName={css.bodyCellContent}
                                          justifyContent="right"
                                          width={DEFAULT_COLUMN_WIDTH}
                                      >
                                          <ArticleStatus
                                              reviewAction={
                                                  article.reviewAction
                                              }
                                          />
                                      </BodyCell>
                                  </TableBodyRow>
                              ))}
                    </TableBody>
                </TableWrapper>
            </div>

            {pagesCount > 1 && (
                <NumberedPagination
                    count={pagesCount}
                    page={currentPage}
                    onChange={onPageChange}
                    className={css.pagination}
                />
            )}
        </>
    )
}

export default AutomateAllRecommendationsTable
