import React, {PropTypes} from 'react'

/**
 * Generic component to create a page header with a title.
 * It accepts extra elements as children.
 *
 * @param {string} title - The header title
 * @param {element} children - Elements to display to the right of header
 */
class PageHeader extends React.Component {
    render() {
        const {title, children, icon} = this.props
        return (
            <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                <h1 className="d-flex align-items-center">
                    {
                        icon && (
                            <i
                                className={`fa fa-fw fa-${icon} mr-2`}
                                style={{color: '#0993f4'}}
                            />
                        )
                    }
                    <div>
                        {title}
                    </div>
                </h1>

                {
                    children && (
                        <div>
                            {this.props.children}
                        </div>
                    )
                }
            </div>
        )
    }
}

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.string,
    children: PropTypes.node,
}

export default PageHeader
