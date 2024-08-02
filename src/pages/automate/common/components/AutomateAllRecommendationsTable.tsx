import React, {useMemo} from 'react'
import Skeleton from 'react-loading-skeleton'
import {Tooltip} from '@gorgias/ui-kit'
import {Link} from 'react-router-dom'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {NumberedPagination} from 'pages/common/components/Paginations'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import useAppSelector from 'hooks/useAppSelector'
import {getHelpCenterFAQList} from 'state/entities/helpCenter/helpCenters'
import Spinner from 'pages/common/components/Spinner'
import {logEvent, SegmentEvent} from 'common/segment'
import {AIArticleRecommendationItem} from '../hooks/useAIArticleRecommendationItems'
import {useAIArticlePublishedPreviewUrl} from '../hooks/useAIArticlePublishedPreviewUrl'
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
    helpCenterId: number
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

const OpenCreatedArticleIcon = ({
    reviewAction,
    templateKey,
    helpCenterId,
}: Pick<AIArticleRecommendationItem, 'reviewAction' | 'templateKey'> & {
    helpCenterId: number
}) => {
    const helpCenters = useAppSelector(getHelpCenterFAQList)
    const helpCenter = useMemo(() => {
        return helpCenters.find((helpCenter) => helpCenter.id === helpCenterId)
    }, [helpCenterId, helpCenters])

    const isHelpCenterLive = !Boolean(helpCenter?.deactivated_datetime)

    const {url: publishedPreviewUrl, article} = useAIArticlePublishedPreviewUrl(
        helpCenter,
        templateKey
    )

    const isArticleUnlisted =
        article && article.translation.visibility_status === 'UNLISTED'

    const redirectToPublishedPreview = useMemo(
        () =>
            isHelpCenterLive &&
            reviewAction === 'publish' &&
            !isArticleUnlisted &&
            publishedPreviewUrl,
        [isHelpCenterLive, reviewAction, isArticleUnlisted, publishedPreviewUrl]
    )

    return (
        <>
            {redirectToPublishedPreview ? (
                <a
                    href={publishedPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={css.createdArticleIcon}
                >
                    <i className="material-icons">open_in_new</i>
                </a>
            ) : (
                <Link
                    to={{
                        pathname: `/app/settings/help-center/${helpCenter?.id}/articles`,
                        search: article ? `?article_id=${article.id}` : '',
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={css.createdArticleIcon}
                >
                    <i className="material-icons">open_in_new</i>
                </Link>
            )}
        </>
    )
}

const ArticleTitle = ({
    title,
    reviewAction,
    templateKey,
    helpCenterId,
}: Pick<
    AIArticleRecommendationItem,
    'reviewAction' | 'title' | 'templateKey'
> & {helpCenterId: number}) => {
    return (
        <div className={css.articleTitle}>
            <span className={css.textTruncate}>{title}</span>
            {reviewAction && reviewAction === 'archive' && <ArchiveBadge />}
            {(reviewAction === 'publish' || reviewAction === 'saveAsDraft') && (
                <OpenCreatedArticleIcon
                    reviewAction={reviewAction}
                    templateKey={templateKey}
                    helpCenterId={helpCenterId}
                />
            )}
        </div>
    )
}

const ArticleStatus = ({
    createArticle,
    reviewAction,
}: Pick<AIArticleRecommendationItem, 'reviewAction' | 'createArticle'>) => {
    const [isCreating, setIsCreating] = React.useState(false)

    return reviewAction === 'publish' || reviewAction === 'saveAsDraft' ? (
        <span className={css.articleStatusWithIcon}>
            <i className="material-icons">check_circle</i>
            Created
        </span>
    ) : isCreating ? (
        <div className={css.creatingArticle}>
            <Spinner color="gloom" width={16} />
            Creating...
        </div>
    ) : (
        <span
            className={css.articleStatus}
            onClick={async () => {
                if (!isCreating) {
                    setIsCreating(true)
                    await createArticle()
                    logEvent(
                        SegmentEvent.AutomateTopQuestionsAllRecommendationsCreateArticle
                    )
                    setIsCreating(false)
                }
            }}
        >
            Create Article
        </span>
    )
}

const AutomateAllRecommendationsTable = ({
    isLoading,
    columns,
    articles,
    pageSize,
    currentPage,
    pagesCount,
    onPageChange,
    helpCenterId,
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
                                              templateKey={article.templateKey}
                                              helpCenterId={helpCenterId}
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
                                              createArticle={
                                                  article.createArticle
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
