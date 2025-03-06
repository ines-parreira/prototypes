import React from 'react'

import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import ScrapedDomainHeader from './ScrapedDomainHeader'

import css from './ScrapedDomainPagesView.less'

const EmptyStatePagesView = () => {
    return <div className={css.emptyState}>No pages generated</div>
}

const ScrapedDomainPagesView = () => {
    const description =
        'AI Agent automatically scrapes all pages from your store’s website to use as knowledge.'
    return (
        <div>
            <ScrapedDomainHeader description={description} />
            <TableWrapper>
                <TableHead>
                    <HeaderCellProperty title="Page" />
                </TableHead>
                <EmptyStatePagesView />
            </TableWrapper>
        </div>
    )
}

export default ScrapedDomainPagesView
