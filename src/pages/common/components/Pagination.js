import React, {PropTypes} from 'react'
import ReactPaginate from 'react-paginate'

export default class Pagination extends React.Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        pageCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        currentPage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    }

    _handlePageClick = ({selected}) => {
        // ReactPaginate works with indexes instead of page number, so page 1 for us is page 0 for the lib
        selected++

        if (parseInt(this.props.currentPage) === selected) {
            return
        }

        return this.props.onChange(selected)
    }

    render() {
        const {
            onChange, // eslint-disable-line
            ...properties,
        } = this.props

        properties.pageCount = parseInt(properties.pageCount)

        // ReactPaginate works with indexes instead of page number, so page 1 for us is page 0 for the lib
        properties.initialPage = parseInt(properties.currentPage) - 1

        if (properties.pageCount <= 1) {
            return null
        }

        return (
            <ReactPaginate
                previousLabel={<i className="fa fa-fw fa-angle-left" />}
                nextLabel={<i className="fa fa-fw fa-angle-right" />}
                pageCount={10}
                marginPagesDisplayed={2}
                pageRangeDisplayed={2}
                onPageChange={this._handlePageClick}
                containerClassName={"pagination"}
                breakClassName={"page-item"}
                breakLabel={<a className="page-link">...</a>}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                activeClassName={"active"}
                {...properties}
            />
        )
    }
}
