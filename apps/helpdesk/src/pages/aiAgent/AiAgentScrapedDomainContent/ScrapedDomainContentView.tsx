import React, { useEffect, useRef, useState } from 'react'

import classnames from 'classnames'
import Skeleton from 'react-loading-skeleton'

import { ToggleField, Tooltip } from '@gorgias/axiom'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
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

import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import {
    CONTENT_TYPE,
    IngestedResourceStatus,
    PAGINATED_ITEMS_PER_PAGE,
} from './constant'
import { ProductImage } from './ProductImage'
import ScrapedDomainHeader from './ScrapedDomainHeader'

import css from './ScrapedDomainContentView.less'

type Props<T> = {
    shopName: string
    isLoading: boolean
    contents: T[]
    onSelect: (id: number) => void
    pageType: string
    selectedId?: string | null
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
    onUpdateAllStatus?: ({
        status,
    }: {
        status: IngestedResourceStatus
    }) => Promise<void>
    isAllEnabled?: boolean
    setIsAllEnabled?: (isAllEnabled: boolean) => void
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
            or has the tag ‘gorgias_do_not_recommend’ in Shopify
        </Tooltip>
    </BodyCell>
)

const getPageDescription = ({
    pageType,
    isActionDrivenAiAgentNavigationEnabled,
    productsRoute,
}: {
    pageType: string
    isActionDrivenAiAgentNavigationEnabled: boolean
    productsRoute: string
}) => {
    switch (pageType) {
        case CONTENT_TYPE.QUESTION:
            return isActionDrivenAiAgentNavigationEnabled ? (
                <>
                    AI Agent automatically generates questions and answers from
                    your website content as knowledge. It also syncs product
                    details to the{' '}
                    <a
                        href={productsRoute}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Products
                    </a>{' '}
                    page to answer product-related questions.
                </>
            ) : (
                'AI Agent automatically generates questions and answers from your website content to use as knowledge.'
            )
        case CONTENT_TYPE.PRODUCT:
            return isActionDrivenAiAgentNavigationEnabled
                ? 'View the products AI Agent can reference and the information available for each, synced from sources like Shopify and your store website.'
                : 'AI Agent uses product details from your Shopify app and store website.'
        case CONTENT_TYPE.FILE_QUESTION:
            return 'AI Agent generates questions and answers from the document to use when responding to customers.'
        case CONTENT_TYPE.URL_QUESTION:
            return 'AI Agent generates questions and answers from the page content to use when responding to customers.'
        default:
            return ''
    }
}

const LoadingState = ({
    index,
    pageType,
}: {
    index: number
    pageType: string
}) => (
    <TableBodyRow key={index} className={css.tableBodyRow}>
        <BodyCell key={index}>
            {pageType === CONTENT_TYPE.PRODUCT && (
                <div className={css.imageLoader}>
                    <Skeleton height={32} width={32} />
                </div>
            )}
            <div className={css.loader}>
                <Skeleton
                    height={pageType === CONTENT_TYPE.PRODUCT ? 32 : 24}
                />
            </div>
            <i className={classnames('material-icons', css.chevronRight)}>
                chevron_right
            </i>
        </BodyCell>
    </TableBodyRow>
)

function ScrapedDomainContentView<T extends ContentType>({
    shopName,
    isLoading,
    contents,
    onSelect,
    pageType,
    selectedId,
    hasNextItems,
    hasPrevItems,
    fetchNextItems,
    fetchPrevItems,
    searchValue,
    onSearch,
    onUpdateStatus,
    onUpdateAllStatus,
    isAllEnabled,
    setIsAllEnabled,
}: Props<T>) {
    const dispatch = useAppDispatch()
    const { routes } = useAiAgentNavigation({ shopName })
    const isActionDrivenAiAgentNavigationEnabled = useFlag(
        FeatureFlagKey.ActionDrivenAiAgentNavigation,
    )
    const description = getPageDescription({
        pageType,
        isActionDrivenAiAgentNavigationEnabled,
        productsRoute: routes.products,
    })

    const [questionStatusMap, setQuestionStatusMap] = useState<
        Record<number, string>
    >({})
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const isLocalUpdateRef = useRef(false)

    useEffect(() => {
        if (
            pageType !== CONTENT_TYPE.PRODUCT ||
            (contents.length === 0 && !isLoading)
        ) {
            setImagesLoaded(true)
            return
        }

        let loadedCount = 0
        const totalImages = contents.length

        contents.forEach((content) => {
            const contentImage = getContentImage(content)
            if (!contentImage) {
                loadedCount++
                if (loadedCount === totalImages) {
                    setImagesLoaded(true)
                }
                return
            }
            const img = new Image()
            img.src = contentImage
            img.onload = img.onerror = () => {
                loadedCount++
                if (loadedCount === totalImages) {
                    setImagesLoaded(true)
                }
            }
        })
    }, [contents, pageType, isLoading])

    const pageTitle = pageType === CONTENT_TYPE.PRODUCT ? 'Product' : 'Question'

    useEffect(() => {
        if (!contents || contents.length === 0 || isLocalUpdateRef.current) {
            isLocalUpdateRef.current = false
            return
        }

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
        isLocalUpdateRef.current = true

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

    const handleMasterToggleChange = async () => {
        if (
            onUpdateAllStatus &&
            setIsAllEnabled &&
            isAllEnabled !== undefined
        ) {
            await onUpdateAllStatus({
                status: isAllEnabled
                    ? IngestedResourceStatus.Disabled
                    : IngestedResourceStatus.Enabled,
            })
            setIsAllEnabled(!isAllEnabled)
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Successfully updated all questions',
                    showDismissButton: true,
                }),
            )
        }
    }

    const displayEmptyState = !isLoading && contents?.length === 0
    const hasMasterToogle =
        !isLoading && contents?.length > 0 && pageType === CONTENT_TYPE.QUESTION

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
        <div>
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
                        {hasMasterToogle && isAllEnabled !== undefined ? (
                            <BodyCell>
                                <div className={css.masterToggle}>
                                    <ToggleField
                                        value={isAllEnabled}
                                        onChange={handleMasterToggleChange}
                                        className={css.toggleInput}
                                    />
                                    Select all questions
                                </div>
                            </BodyCell>
                        ) : (
                            <HeaderCellProperty title={pageTitle} />
                        )}
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
                                    <LoadingState
                                        key={index}
                                        index={index}
                                        pageType={pageType}
                                    />
                                ))}
                        {contents &&
                            contents.length > 0 &&
                            contents.map((content: any, index: number) => {
                                const contentId =
                                    pageType === CONTENT_TYPE.QUESTION
                                        ? content.article_id
                                        : content.id
                                const isSelected =
                                    selectedId &&
                                    String(contentId) === selectedId
                                return (
                                    <TableBodyRow
                                        key={content.id}
                                        className={classnames(
                                            css.tableBodyRow,
                                            {
                                                [css.selected]: isSelected,
                                            },
                                        )}
                                        onClick={() => onSelect(contentId)}
                                    >
                                        <BodyCell
                                            className={classnames({
                                                [css.productCell]:
                                                    pageType ===
                                                    CONTENT_TYPE.PRODUCT,
                                                [css.questionCell]:
                                                    pageType !==
                                                    CONTENT_TYPE.PRODUCT,
                                                [css.masterToggleCell]:
                                                    hasMasterToogle,
                                            })}
                                        >
                                            {pageType !==
                                            CONTENT_TYPE.PRODUCT ? (
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
                                                        className={
                                                            css.toggleInput
                                                        }
                                                    />
                                                </div>
                                            ) : (
                                                <ProductImage
                                                    index={index}
                                                    imageSource={getContentImage(
                                                        content,
                                                    )}
                                                    allImagesLoaded={
                                                        imagesLoaded
                                                    }
                                                    skeletonsize={32}
                                                    skeletonClassname={
                                                        css.imagesSkeleton
                                                    }
                                                    productImageClassname={
                                                        css.productImage
                                                    }
                                                />
                                            )}

                                            {content.title}
                                        </BodyCell>

                                        {pageType === CONTENT_TYPE.PRODUCT &&
                                            (getContentIsUsedByAiAgent(
                                                content,
                                            ) ? (
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
                                )
                            })}
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
        </div>
    )
}

export default ScrapedDomainContentView
