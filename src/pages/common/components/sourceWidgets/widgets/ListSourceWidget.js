import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import SourceWidget from '../SourceWidget'

class ListSourceWidget extends React.Component {
    render() {
        const {source, widget, template, isParentList} = this.props

        const updatedTemplate = template.set(
            'absolutePath',
            template.get('absolutePath').concat(['[]'])
        )

        const passedTemplate = updatedTemplate
            .getIn(['widgets', '0'])
            .set(
                'templatePath',
                `${updatedTemplate.get('templatePath', '')}.widgets.0`
            )

        const className = classnames('list', {
            draggable: !isParentList,
        })

        return (
            <div className={className} data-key={template.get('path')}>
                {source
                    .toList()
                    .take(1)
                    .map((d, i) => {
                        return (
                            <SourceWidget
                                key={i}
                                source={d}
                                parent={updatedTemplate}
                                template={passedTemplate}
                                widget={widget}
                            />
                        )
                    })}
            </div>
        )
    }
}

ListSourceWidget.propTypes = {
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
    isParentList: PropTypes.bool.isRequired,
}

ListSourceWidget.defaultProps = {
    isParentList: false,
}

export default ListSourceWidget
