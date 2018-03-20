// @flow

import React, {type Node} from 'react'

type Props = {
    title: string | Object,
    children?: Node,
}

/**
 * Generic component to create a page header with a title.
 * It accepts extra elements as children.
 */
export default class PageHeader extends React.Component<Props> {
    render() {
        const {title, children} = this.props
        return (
            <div className="d-flex align-items-center justify-content-between flex-wrap page-header">
                {
                    typeof title === 'string'
                        ? <h1 className="d-flex align-items-center">{title}</h1>
                        : title
                }
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
