import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {List} from 'immutable'
import {Button} from 'reactstrap'

import {compare} from '../../../../../utils'
import InfobarWidget from '../InfobarWidget'

class ListInfobarWidget extends React.Component {
    state = {
        showMoreTimes: 0, // how many times the agent asked to show more of the list
    }

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

        let limit = template.getIn(['meta', 'limit'])
        let sourceList = orderedSource
        let exclusionMessage = null

        // display only 1 element of the list if editing widgets
        if (isEditing) {
            limit = 1
        }

        // use limit only if we display cards in the list (display 1 element if list of lists)
        if (!isParentOfCard) {
            limit = 1
        }

        if (limit) {
            // calculate limit of cards displayed in this array
            limit = limit * (this.state.showMoreTimes + 1)
            // limit displayed source data
            sourceList = orderedSource.take(limit)

            // if there is a limit, explain it under the card
            const excludedItems = source.size - limit
            const hasExcludedItems = excludedItems > 0

            if (hasExcludedItems) {
                exclusionMessage = (
                    <div className="d-flex align-items-center">
                        {
                            !isEditing && (
                                <Button
                                    type="button"
                                    color="link"
                                    className="p-0 mr-2"
                                    onClick={() => {
                                        this.setState({showMoreTimes: this.state.showMoreTimes + 1})
                                    }}
                                >
                                    <i className="fa fa-fw fa-chevron-down mr-1" />
                                    Show more
                                </Button>
                            )
                        }
                        <div>{isEditing ? `${excludedItems} more items` : `(${excludedItems} remaining)`}</div>
                    </div>
                )
            }
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
                    !sourceList.isEmpty()
                    && isParentOfCard
                    && exclusionMessage
                    && (
                        <div className="footer clearfix">
                            {exclusionMessage}
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
