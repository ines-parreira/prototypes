import React, {PropTypes} from 'react'
import moment from 'moment-timezone'
import _ from 'lodash'
import {fromJS} from 'immutable'
import {DatetimeLabel} from '../../utils/labels'
import * as utils from '../../../../utils'
import {prepareWidgetToDisplay} from './utils'

import ListInfobarWidget from './widgets/ListInfobarWidget'
import WrapperInfobarWidget from './widgets/WrapperInfobarWidget'
import CardInfobarWidget from './widgets/CardInfobarWidget'
import FieldInfobarWidget from './widgets/FieldInfobarWidget'

class InfobarWidget extends React.Component {
    render() {
        const {
            parent,
            source,
            widget,
            editing,
            isEditing
        } = this.props

        // prevent buggy display if source...
        // ... is empty
        if (!source) {
            return null
        }

        // ... is not an object
        if (!_.isObject(source)) {
            return null
        }

        // ... is not immutable
        if (!source.isEmpty || (source.isEmpty && !_.isFunction(source.isEmpty))) {
            return null
        }

        // ... is an empty Immutable
        if (source.isEmpty()) {
            return null
        }

        const {updatedWidget, data, type} = prepareWidgetToDisplay(widget, source, parent)

        const isParentList = parent && parent.get('type') === 'list'

        // DISPLAY
        switch (type) {
            case 'wrapper': {
                return (
                    <WrapperInfobarWidget
                        isEditing={isEditing}
                        source={data || fromJS({})}
                        widget={updatedWidget}
                        editing={editing}
                    />
                )
            }
            case 'list': {
                return (
                    <ListInfobarWidget
                        isEditing={isEditing}
                        isParentList={isParentList}
                        source={data || fromJS({})}
                        widget={updatedWidget}
                        editing={editing}
                    />
                )
            }
            case 'card': {
                return (
                    <CardInfobarWidget
                        isEditing={isEditing}
                        isParentList={isParentList}
                        source={data || fromJS({})}
                        widget={updatedWidget}
                        editing={editing}
                        parent={parent}
                    />
                )
            }
            case 'divider': {
                return (
                    <div className="ui divider"></div>
                )
            }
            default:
        }

        let fieldValue = ''

        if (!_.isUndefined(data) && !_.isNull(data)) {
            if (_.isString(data)) {
                fieldValue = data
            }

            switch (type) {
                case 'text': {
                    fieldValue = data
                    break
                }
                case 'date': {
                    fieldValue = <DatetimeLabel dateTime={data} />
                    break
                }
                case 'age': {
                    try {
                        fieldValue = moment().diff(data, 'years')
                        fieldValue += ` (${moment(data).format('YYYY-MM-DD')})`
                    } catch (e) {
                        fieldValue = data
                    }
                    break
                }
                case 'url': {
                    if (utils.isUrl(data)) {
                        fieldValue = (
                            <a
                                href={data}
                                target="_blank"
                            >
                                {data.length > 60 ? `${data.slice(0, 57)}...` : data}
                            </a>
                        )
                    }
                    break
                }
                case 'email': {
                    if (utils.isEmail(data)) {
                        fieldValue = (
                            <a href={`mailto:${data}`} target="_blank">{data}</a>
                        )
                    }
                    break
                }
                case 'boolean': {
                    let isTrue = true

                    if (_.isBoolean(data)) {
                        isTrue = data
                    }

                    if (_.isString(data)) {
                        isTrue = data === 'true' || data.toString() === '1'
                    }

                    fieldValue = isTrue
                        ? <a className="ui mini green label">True</a>
                        : <a className="ui mini red label">False</a>
                    break
                }
                case 'array': {
                    if (_.isArray(data)) {
                        fieldValue = data.join(', ')
                    }
                    break
                }
                default:
            }
        }

        return (
            <FieldInfobarWidget
                isEditing={isEditing}
                isParentList={isParentList}
                value={fieldValue}
                widget={updatedWidget}
                editing={editing}
            />
        )
    }
}

InfobarWidget.propTypes = {
    editing: PropTypes.object,
    parent: PropTypes.object,
    source: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired
}

export default InfobarWidget
