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
            <div className="ui sixteen wide column flex-spaced-row no-wrap page-header">
                <div>
                    <h1 className="ui header">{title}</h1>
                </div>
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
