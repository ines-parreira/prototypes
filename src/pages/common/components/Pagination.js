import React from 'react'
import PropTypes from 'prop-types'
import ReactPaginate from 'react-paginate'

export default class Pagination extends React.Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        pageCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
            .isRequired,
        currentPage: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
            .isRequired,
        className: PropTypes.string,
    }

    _handlePageClick = ({selected}) => {
        // ReactPaginate works with indexes instead of page number, so page 1 for us is page 0 for the lib
        const nextPageNumber = selected + 1

        if (parseInt(this.props.currentPage) === nextPageNumber) {
            return
        }

        return this.props.onChange(nextPageNumber)
    }

    render() {
        const {
            onChange, // eslint-disable-line
            className,
            ...properties
        } = this.props

        properties.pageCount = parseInt(properties.pageCount)

        // ReactPaginate works with indexes instead of page number, so page 1 for us is page 0 for the lib
        const forcePage = parseInt(properties.currentPage) - 1
        delete properties.currentPage

        if (properties.pageCount <= 1) {
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
                containerClassName={`pagination ${className}`}
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
            />
        )
    }
}
