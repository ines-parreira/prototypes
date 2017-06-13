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
        const {title, children, icon} = this.props
        return (
            <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                <h1
                    className="d-flex align-items-center"
                >
                    {icon && (
                        <i
                            className={`fa fa-fw fa-${icon} mr-2`}
                            style={{color: '#0993f4'}}
                        />
                    )}
                    <div>
                        {title}
                    </div>
                </h1>

                {children && this._renderChildren()}
            </div>
        )
    }
}

PageHeader.propTypes = {
    title: React.PropTypes.string.isRequired,
    icon: React.PropTypes.string.isRequired,
    children: React.PropTypes.element,
}

export default PageHeader
