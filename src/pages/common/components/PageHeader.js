import React from 'react'

/**
 * Generic component to create a page header with a title.
 * It accepts extra elements as children.
 *
 * @param {string} title - The header title
 * @param {element} children - Elements to display to the right of header
 */
class PageHeader extends React.Component {
    _renderChildren = () => (
        <div>
            {this.props.children}
        </div>
    )

    render() {
        const {title, children} = this.props
        return (
            <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                <h1
                    className="ui header"
                    style={{marginBottom: 0}}
                >
                    {title}
                </h1>

                {children && this._renderChildren()}
            </div>
        )
    }
}

PageHeader.propTypes = {
    title: React.PropTypes.string.isRequired,
    children: React.PropTypes.element,
}

export default PageHeader
