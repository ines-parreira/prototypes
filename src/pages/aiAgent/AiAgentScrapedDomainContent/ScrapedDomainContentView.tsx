import { useEffect, useState } from 'react'

import classnames from 'classnames'
import Skeleton from 'react-loading-skeleton'

import { ToggleField, Tooltip } from '@gorgias/merchant-ui-kit'

import useAppDispatch from 'hooks/useAppDispatch'
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
    hasNextItems: boolean
    hasPrevItems: boolean
    fetchNextItems: () => void
    fetchPrevItems: () => void
    searchValue: string
    onSearch: (value: string) => void
    onUpdateStatus?: (
        id: number,
        { status }: { status: IngestedResourceStatus },
    ) => Promise<void>
}

const EmptyStateView = ({ pageType }: { pageType: string }) => {
    return (
        <div className={css.emptyState}>
            {pageType === CONTENT_TYPE.QUESTION
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

function ScrapedDomainContentView<
    T extends {
        id: number
        title: string
        image?: {
            src: string
        } | null
        status?: string
        is_used_by_ai_agent?: boolean
    },
>({
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
    const description =
        pageType === CONTENT_TYPE.QUESTION
            ? 'AI Agent automatically generates questions and answers from your website content to use as knowledge.'
            : 'AI Agent uses product details from your Shopify app and store website.'

    const [questionStatusMap, setQuestionStatusMap] = useState<
        Record<number, string>
    >({})

    useEffect(() => {
        const initialStatusMap = contents.reduce(
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
                        <HeaderCellProperty title={pageType} />
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
                        {contents.length > 0 &&
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
                                        })}
                                    >
                                        {pageType === CONTENT_TYPE.QUESTION ? (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                }}
                                            >
                                                <ToggleField
                                                    value={
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
                                                image={content.image?.src}
                                            />
                                        )}

                                        {content.title}
                                    </BodyCell>

                                    {pageType === CONTENT_TYPE.PRODUCT &&
                                        (content.is_used_by_ai_agent ? (
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

            <Navigation
                className={css.navigation}
                hasNextItems={hasNextItems}
                hasPrevItems={hasPrevItems}
                fetchNextItems={fetchNextItems}
                fetchPrevItems={fetchPrevItems}
            />
        </>
    )
}

export default ScrapedDomainContentView
