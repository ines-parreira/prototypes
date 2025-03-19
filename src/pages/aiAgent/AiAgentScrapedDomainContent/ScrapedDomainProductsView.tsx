import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import ScrapedDomainHeader from './ScrapedDomainHeader'

import css from './ScrapedDomainProductsView.less'

const EmptyStateProductsView = () => {
    return <div className={css.emptyState}>No products available</div>
}

const ScrapedDomainProductsView = () => {
    const description =
        'AI Agent uses product details from your store’s website content and your Shopify integration.'
    return (
        <div>
            <ScrapedDomainHeader description={description} />
            <TableWrapper>
                <TableHead>
                    <HeaderCellProperty title="Product" />
                </TableHead>
                <EmptyStateProductsView />
            </TableWrapper>
        </div>
    )
}

export default ScrapedDomainProductsView
