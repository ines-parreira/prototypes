import classnames from 'classnames'
import Skeleton from 'react-loading-skeleton'

import Navigation from 'pages/common/components/Navigation/Navigation'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

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
    onSelect: (content: T) => void
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
    ) => void
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

function ScrapedDomainContentView<
    T extends {
        id: number
        title: string
        image?: {
            src: string
        } | null
        status?: string
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
}: Props<T>) {
    const description =
        pageType === CONTENT_TYPE.QUESTION
            ? 'AI Agent automatically generates questions and answers from your website content to use as knowledge.'
            : 'AI Agent uses product details from your store website and your Shopify integration.'

    // TO DO: uncomment when this task (https://linear.app/gorgias/issue/AIKNL-287/createremove-a-resource-fromin-ml-recommender-when-ingested-resource) is implemented
    // const handleToggleChange = ({
    //     id,
    //     currentStatus,
    // }: {
    //     id: number
    //     currentStatus?: string
    // }) => {
    //     if (onUpdateStatus) {
    //         onUpdateStatus(id, {
    //             status:
    //                 currentStatus === IngestedResourceStatus.Disabled
    //                     ? IngestedResourceStatus.Enabled
    //                     : IngestedResourceStatus.Disabled,
    //         })
    //     }
    // }
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

    // TO DO: uncomment when this task (https://linear.app/gorgias/issue/AIKNL-287/createremove-a-resource-fromin-ml-recommender-when-ingested-resource) is implemented
    // const QuestionToggle = ({ content }: { content: T }) => {
    //     return (
    //         <div
    //             onClick={(e) => {
    //                 e.stopPropagation()
    //             }}
    //         >
    //             <ToggleField
    //                 value={content.status === IngestedResourceStatus.Enabled}
    //                 onChange={() =>
    //                     handleToggleChange({
    //                         id: content.id,
    //                         currentStatus: content.status,
    //                     })
    //                 }
    //                 className={css.toggleInput}
    //             />
    //         </div>
    //     )
    // }

    return (
        <>
            <div>
                <ScrapedDomainHeader
                    description={description}
                    searchValue={searchValue}
                    onSearch={onSearch}
                />
                <TableWrapper className={css.tableWrapper}>
                    <TableHead>
                        <HeaderCellProperty title={pageType} />
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
                                    onClick={() => onSelect(content)}
                                >
                                    <BodyCell>
                                        {pageType ===
                                        CONTENT_TYPE.QUESTION ? null : (
                                            <ProductImage
                                                image={content.image?.src}
                                            />
                                        )}

                                        {content.title}
                                    </BodyCell>
                                    <BodyCell>
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
