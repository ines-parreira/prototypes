import React, {Component} from 'react'
import ReactPaginate from 'react-paginate'

type Props = {
    onChange: (nextPage: number) => void
    pageCount: string | number
    currentPage: string | number
    className?: string
}

export default class Pagination extends Component<Props> {
    _handlePageClick = ({selected}: {selected: number}) => {
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
        const {className, ...properties} = this.props

        const pageCount =
            typeof properties.pageCount === 'string'
                ? parseInt(properties.pageCount)
                : properties.pageCount

        // ReactPaginate works with indexes instead of page number, so page 1 for us is page 0 for the lib
        const forcePage =
            typeof properties.currentPage === 'string'
                ? parseInt(properties.currentPage) - 1
                : properties.currentPage - 1
        delete properties.currentPage

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
                containerClassName={`pagination ${className || ''}`}
                breakClassName={'page-item'}
                breakLabel={<a className="page-link">...</a>}
                pageClassName={'page-item'}
                pageLinkClassName={'page-link'}
                previousClassName={'page-item'}
                previousLinkClassName={'page-link'}
                nextClassName={'page-item'}
                nextLinkClassName={'page-link'}
                activeClassName={'active'}
                disableInitialCallback={true}
                forcePage={forcePage}
                {...properties}
                pageCount={pageCount}
            />
        )
    }
}
