import classnames from 'classnames'
import Skeleton from 'react-loading-skeleton'

import { ToggleField } from '@gorgias/merchant-ui-kit'

import Navigation from 'pages/common/components/Navigation/Navigation'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import { CONTENT_TYPE, PAGINATED_ITEMS_PER_PAGE } from './constant'
import ScrapedDomainHeader from './ScrapedDomainHeader'
import { ScrapedContent } from './types'

import css from './ScrapedDomainContentView.less'

const DEFAULT_COLUMN_WIDTH = 188

type Props = {
    isLoading: boolean
    content: ScrapedContent[]
    onSelect: (content: ScrapedContent) => void
    pageType: string
    hasNextItems: boolean
    hasPrevItems: boolean
    fetchNextItems: () => void
    fetchPrevItems: () => void
    searchValue: string
    onSearch: (value: string) => void
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

const ScrapedDomainContentView = ({
    isLoading,
    content,
    onSelect,
    pageType,
    hasNextItems,
    hasPrevItems,
    fetchNextItems,
    fetchPrevItems,
    searchValue,
    onSearch,
}: Props) => {
    const description =
        pageType === CONTENT_TYPE.QUESTION
            ? 'AI Agent automatically generates questions and answers from your store’s website content to use as knowledge.'
            : 'AI Agent uses product details from your store’s website content and your Shopify integration.'

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
                    {content.length ? (
                        <TableBody>
                            {isLoading
                                ? Array(PAGINATED_ITEMS_PER_PAGE)
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
                                      ))
                                : content.map((content) => (
                                      <TableBodyRow
                                          key={content.id}
                                          className={css.tableBodyRow}
                                          onClick={() => onSelect(content)}
                                      >
                                          <BodyCell>
                                              {pageType ===
                                              CONTENT_TYPE.QUESTION ? (
                                                  <ToggleField
                                                      value={true}
                                                      className={
                                                          css.toggleInput
                                                      }
                                                  />
                                              ) : (
                                                  <img
                                                      src={content.image?.src}
                                                      alt="product-image"
                                                      className={
                                                          css.productImage
                                                      }
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
                    ) : (
                        <EmptyStateView pageType={pageType} />
                    )}
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
