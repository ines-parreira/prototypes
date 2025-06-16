import React, { useEffect, useState } from 'react'

import classnames from 'classnames'
import Skeleton from 'react-loading-skeleton'

import { ToggleField, Tooltip } from '@gorgias/merchant-ui-kit'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    ContentType,
    ProductIngestedResourceWithArticleId,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/types'
import Navigation from 'pages/common/components/Navigation/Navigation'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import IconInput from 'pages/common/forms/input/IconInput'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    CONTENT_TYPE,
    IngestedResourceStatus,
    PAGINATED_ITEMS_PER_PAGE,
} from './constant'
import ScrapedDomainHeader from './ScrapedDomainHeader'

import css from './ScrapedDomainContentView.less'

const DEFAULT_COLUMN_WIDTH = 188

type Props<T> = {
    isLoading: boolean
    contents: T[]
    onSelect: (id: number) => void
    pageType: string
    hasNextItems?: boolean
    hasPrevItems?: boolean
    fetchNextItems?: () => void
    fetchPrevItems?: () => void
    searchValue: string
    onSearch?: (value: string) => void
    onUpdateStatus?: (
        id: number,
        { status }: { status: IngestedResourceStatus },
    ) => Promise<void>
}

const EmptyStateView = ({ pageType }: { pageType: string }) => {
    return (
        <div className={css.emptyState}>
            {pageType !== CONTENT_TYPE.PRODUCT
                ? 'No questions generated'
                : 'No products available'}
        </div>
    )
}

const ColumnIsUsedByAiAgent = ({ id }: { id: number }) => (
    <BodyCell>
        <IconInput
            id={`ai-agent-status-${id}`}
            icon="check"
            className={css.checkIcon}
        />
        <Tooltip target={`ai-agent-status-${id}`} placement="bottom">
            Product is currently in use by AI Agent as knowledge
        </Tooltip>
    </BodyCell>
)

const ColumnIsNotUsedByAiAgent = ({ id }: { id: number }) => (
    <BodyCell>
        <IconInput
            id={`ai-agent-status-${id}`}
            icon="close"
            className={css.closeIcon}
        />

        <Tooltip target={`ai-agent-status-${id}`} placement="bottom">
            Product is not in use by AI Agent if it is not active or published,
            does not have at least 1 variant or has the tag
            ‘gorgias_do_not_recommend’ in Shopify
        </Tooltip>
    </BodyCell>
)

const getPageDescription = (pageType: string) => {
    switch (pageType) {
        case CONTENT_TYPE.QUESTION:
            return 'AI Agent automatically generates questions and answers from your website content to use as knowledge.'
        case CONTENT_TYPE.PRODUCT:
            return 'AI Agent uses product details from your Shopify app and store website.'
        case CONTENT_TYPE.FILE_QUESTION:
            return 'AI Agent generates questions and answers from the document to use when responding to customers.'
        case CONTENT_TYPE.URL_QUESTION:
            return 'AI Agent generates questions and answers from the page content to use when responding to customers.'
        default:
            return ''
    }
}

function ScrapedDomainContentView<T extends ContentType>({
    isLoading,
    contents,
    onSelect,
    pageType,
    hasNextItems,
    hasPrevItems,
    fetchNextItems,
    fetchPrevItems,
    searchValue,
    onSearch,
    onUpdateStatus,
}: Props<T>) {
    const dispatch = useAppDispatch()
    const description = getPageDescription(pageType)

    const [questionStatusMap, setQuestionStatusMap] = useState<
        Record<number, string>
    >({})

    const pageTitle = pageType === CONTENT_TYPE.PRODUCT ? 'Product' : 'Question'

    useEffect(() => {
        const initialStatusMap = contents?.reduce(
            (acc, item) => {
                acc[item.id] = item.status || IngestedResourceStatus.Disabled
                return acc
            },
            {} as Record<number, string>,
        )
        setQuestionStatusMap(initialStatusMap)
    }, [contents])

    const handleToggleChange = (content: T) => {
        const newStatus =
            content.status === IngestedResourceStatus.Disabled
                ? IngestedResourceStatus.Enabled
                : IngestedResourceStatus.Disabled

        setQuestionStatusMap((prev) => ({
            ...prev,
            [content.id]: newStatus,
        }))

        if (onUpdateStatus) {
            onUpdateStatus(content.id, {
                status: newStatus,
            })
                .then(() => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Successfully updated question',
                            showDismissButton: true,
                        }),
                    )
                })
                .catch(() => {
                    setQuestionStatusMap((prev) => ({
                        ...prev,
                        [content.id]: content.status as IngestedResourceStatus,
                    }))
                })
        }
    }
    const displayEmptyState = !isLoading && contents?.length === 0

    const ProductImage = ({ image }: { image: string | undefined }) => {
        if (image) {
            return (
                <img
                    src={image}
                    alt="product-image"
                    className={css.productImage}
                />
            )
        }
        return <div className={classnames(css.productImage, css.color)} />
    }

    const getContentImage = (item: T): string | undefined => {
        if ('image' in item) {
            return (item as ProductIngestedResourceWithArticleId).image?.src
        }
        return undefined
    }

    const getContentIsUsedByAiAgent = (item: T): boolean | undefined => {
        if ('is_used_by_ai_agent' in item) {
            return (item as ProductIngestedResourceWithArticleId)
                .is_used_by_ai_agent
        }
        return undefined
    }

    return (
        <>
            <div>
                <ScrapedDomainHeader
                    description={description}
                    searchValue={searchValue}
                    onSearch={onSearch}
                />
                <TableWrapper
                    className={classnames(css.tableWrapper, {
                        [css.productTable]: pageType === CONTENT_TYPE.PRODUCT,
                    })}
                >
                    <TableHead>
                        <HeaderCellProperty title={pageTitle} />
                        {pageType === CONTENT_TYPE.PRODUCT && !isLoading && (
                            <HeaderCellProperty title="IN USE BY AI AGENT" />
                        )}
                    </TableHead>

                    <TableBody>
                        {displayEmptyState && (
                            <TableBodyRow>
                                <BodyCell>
                                    <EmptyStateView pageType={pageType} />
                                </BodyCell>
                            </TableBodyRow>
                        )}

                        {isLoading &&
                            Array(PAGINATED_ITEMS_PER_PAGE)
                                .fill(null)
                                .map((_, index) => (
                                    <TableBodyRow
                                        key={index}
                                        className={css.tableBodyRow}
                                    >
                                        <BodyCell
                                            key={index}
                                            width={DEFAULT_COLUMN_WIDTH}
                                        >
                                            <div className={css.loader}>
                                                <Skeleton height={24} />
                                            </div>
                                        </BodyCell>
                                    </TableBodyRow>
                                ))}
                        {contents &&
                            contents.length > 0 &&
                            contents.map((content) => (
                                <TableBodyRow
                                    key={content.id}
                                    className={css.tableBodyRow}
                                    onClick={() => onSelect(content.id)}
                                >
                                    <BodyCell
                                        className={classnames({
                                            [css.productCell]:
                                                pageType ===
                                                CONTENT_TYPE.PRODUCT,
                                            [css.questionCell]:
                                                pageType !==
                                                CONTENT_TYPE.PRODUCT,
                                        })}
                                    >
                                        {pageType !== CONTENT_TYPE.PRODUCT ? (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                }}
                                            >
                                                <ToggleField
                                                    value={
                                                        questionStatusMap &&
                                                        questionStatusMap[
                                                            content.id
                                                        ] ===
                                                            IngestedResourceStatus.Enabled
                                                    }
                                                    onChange={() => {
                                                        handleToggleChange(
                                                            content,
                                                        )
                                                    }}
                                                    className={css.toggleInput}
                                                />
                                            </div>
                                        ) : (
                                            <ProductImage
                                                image={getContentImage(content)}
                                            />
                                        )}

                                        {content.title}
                                    </BodyCell>

                                    {pageType === CONTENT_TYPE.PRODUCT &&
                                        (getContentIsUsedByAiAgent(content) ? (
                                            <ColumnIsUsedByAiAgent
                                                id={content.id}
                                            />
                                        ) : (
                                            <ColumnIsNotUsedByAiAgent
                                                id={content.id}
                                            />
                                        ))}
                                    <BodyCell justifyContent="right">
                                        <i
                                            className={classnames(
                                                'material-icons',
                                                css.chevronRight,
                                            )}
                                        >
                                            chevron_right
                                        </i>
                                    </BodyCell>
                                </TableBodyRow>
                            ))}
                    </TableBody>
                </TableWrapper>
            </div>

            {!!fetchNextItems &&
                !!fetchPrevItems &&
                hasNextItems !== undefined &&
                hasPrevItems !== undefined && (
                    <Navigation
                        className={css.navigation}
                        hasNextItems={hasNextItems}
                        hasPrevItems={hasPrevItems}
                        fetchNextItems={fetchNextItems}
                        fetchPrevItems={fetchPrevItems}
                    />
                )}
        </>
    )
}

export default ScrapedDomainContentView
