import React, { Component } from 'react'

import classNames from 'classnames'
import _omit from 'lodash/omit'
import ReactPaginate from 'react-paginate'

import css from './Pagination.less'

type Props = {
    onChange: (nextPage: number) => void
    pageCount: number | string
    currentPage: number | string
    className?: string
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Pagination />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
export default class Pagination extends Component<Props> {
    _handlePageClick = ({ selected }: { selected: number }) => {
        // ReactPaginate works with indexes instead of page number, so page 1 for us is page 0 for the lib
        const nextPageNumber = selected + 1
        const currentPage =
            typeof this.props.currentPage === 'string'
                ? parseInt(this.props.currentPage)
                : this.props.currentPage

        if (currentPage === nextPageNumber) {
            return
        }

        return this.props.onChange(nextPageNumber)
    }

    render() {
        const { className, ...properties } = this.props

        const pageCount =
            typeof properties.pageCount === 'string'
                ? parseInt(properties.pageCount)
                : properties.pageCount

        // ReactPaginate works with indexes instead of page number, so page 1 for us is page 0 for the lib
        const forcePage =
            typeof properties.currentPage === 'string'
                ? parseInt(properties.currentPage) - 1
                : properties.currentPage - 1

        if (pageCount <= 1) {
            return null
        }

        return (
            <ReactPaginate
                previousLabel={
                    <i className="material-icons md-2">keyboard_arrow_left</i>
                }
                nextLabel={
                    <i className="material-icons md-2">keyboard_arrow_right</i>
                }
                marginPagesDisplayed={2}
                pageRangeDisplayed={2}
                onPageChange={this._handlePageClick}
                breakLabel={<a className={css.pageLink}>...</a>}
                containerClassName={classNames(css.pagination, className)}
                breakClassName={css.pageItem}
                pageClassName={css.pageItem}
                pageLinkClassName={css.pageLink}
                previousClassName={css.pageItem}
                previousLinkClassName={css.pageLink}
                nextClassName={css.pageItem}
                nextLinkClassName={css.pageLink}
                activeClassName={css.active}
                disabledClassName={css.disabled}
                disableInitialCallback={true}
                forcePage={forcePage}
                {..._omit(properties, 'currentPage')}
                pageCount={pageCount}
            />
        )
    }
}
