import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {List} from 'immutable'

import {compare} from '../../../../../utils'
import InfobarWidget from '../InfobarWidget'

class ListInfobarWidget extends React.Component {
    render() {
        const {
            isEditing,
            isParentList,
            source,
            widget,
            template,
            editing,
        } = this.props

        const updatedTemplate = template
            .set('absolutePath', template.get('absolutePath').concat(['[]']))

        const passedTemplate = updatedTemplate
            .getIn(['widgets', '0'])
            .set('templatePath', `${updatedTemplate.get('templatePath', '')}.widgets.0`)

        const isParentOfCard = updatedTemplate.getIn(['widgets', 0, 'type'], '') === 'card'

        // if source data is not a list, don't try to display it as a list
        // it means incoming data does not have the expected shape
        if (!List.isList(source)) {
            return null
        }

        let orderedSource = source
        // order source
        const orderByConfig = template.getIn(['meta', 'orderBy'])

        if (!isEditing && orderByConfig) {
            // format of config : "-name" would tell order by 'name' DESC
            const orderByProperty = orderByConfig.slice(1)
            orderedSource = orderedSource.sort((a, b) => compare(a.get(orderByProperty), b.get(orderByProperty)))

            const orderByDirection = orderByConfig.slice(0, 1)
            if (orderByDirection === '-') {
                orderedSource = orderedSource.reverse()
            }
        }

        // calculate limit of cards displayed in this array
        let limit = isEditing ? 1 : template.getIn(['meta', 'limit'])
        limit = isParentOfCard ? limit : 1
        const sourceList = limit ? orderedSource.take(limit) : orderedSource

        let hasExcluded = false
        let exclusionMessage = ''

        // if there is a limit, explain it under the card
        if (limit) {
            const excluded = source.size - limit
            hasExcluded = excluded > 0
            exclusionMessage = `${limit} shown above (${excluded} remaining)`
        }

        const className = classnames('list', {
            draggable: !isParentList
        })

        return (
            <div
                className={className}
                data-key={`${template.get('path')}[]`}
            >
                {
                    sourceList
                        .map((d, i) => {
                            return (
                                <InfobarWidget
                                    key={i}
                                    source={d}
                                    parent={updatedTemplate}
                                    widget={widget}
                                    template={passedTemplate}
                                    editing={editing}
                                    isEditing={isEditing}
                                    open={i === 0}
                                />
                            )
                        })
                }
                {
                    !!sourceList.size
                    && isParentOfCard
                    && hasExcluded
                    && (
                        <div className="ui message blue footer clearfix">
                            {
                                hasExcluded && (
                                    <span>{exclusionMessage}</span>
                                )
                            }
                        </div>
                    )
                }
            </div>
        )
    }
}

ListInfobarWidget.propTypes = {
    editing: PropTypes.object,
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    template: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isParentList: PropTypes.bool.isRequired,
    open: PropTypes.bool
}

ListInfobarWidget.defaultProps = {
    isEditing: false
}

export default ListInfobarWidget
