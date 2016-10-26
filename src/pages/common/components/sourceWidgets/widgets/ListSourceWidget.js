import React, {PropTypes} from 'react'
import classnames from 'classnames'

import SourceWidget from '../SourceWidget'

class ListSourceWidget extends React.Component {
    render() {
        const {
            source,
            widget,
            editing,
            isParentList
        } = this.props

        const updatedWidget = widget
            .set('absolutePath', `${widget.get('absolutePath')}[]`)

        const passedWidget = updatedWidget
            .getIn(['widgets', '0'])
            .set('templatePath', `${updatedWidget.get('templatePath', '')}.widgets.0`)

        const className = classnames('list', {
            draggable: !isParentList
        })

        return (
            <div
                className={className}
                data-key={widget.get('path')}
            >
                {
                    source
                        .toList()
                        .take(1)
                        .map((d, i) => {
                            return (
                                <SourceWidget
                                    key={i}
                                    source={d}
                                    parent={updatedWidget}
                                    widget={passedWidget}
                                    editing={editing}
                                />
                            )
                        })
                }
            </div>
        )
    }
}

ListSourceWidget.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    isParentList: PropTypes.bool.isRequired
}

ListSourceWidget.defaultProps = {
    isParentList: false
}

export default ListSourceWidget
