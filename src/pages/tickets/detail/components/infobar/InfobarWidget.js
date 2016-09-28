import React, {PropTypes} from 'react'
import moment from 'moment-timezone'
import _ from 'lodash'
import {fromJS} from 'immutable'
import {DatetimeLabel} from '../../../../common/utils/labels'
import * as utils from '../../../../../utils'

import ListWidget from './widgets/ListWidget'
import CardWidget from './widgets/CardWidget'
import FieldWidget from './widgets/FieldWidget'

class InfobarWidget extends React.Component {
    render() {
        const {
            parent,
            source,
            widget,
            editing
        } = this.props

        // prevent buggy display if source is empty
        if (!source || source.isEmpty()) {
            return null
        }

        // build absolute path of widget
        const parentPath = !!parent && parent.get('absolutePath', parent.get('path', ''))
        const ownPath = widget.get('path', '')
        const absolutePath = parentPath ? `${parentPath}${ownPath ? `.${ownPath}` : ''}` : widget.get('path')
        let updatedWidget = widget.set('absolutePath', absolutePath)

        // get data of widget in shortcuts
        const path = updatedWidget.get('path', '')
        const data = path ? source.getIn(path.split('.')) : source
        const type = updatedWidget.get('type', '')

        const isParentList = parent && parent.get('type') === 'list'

        const isEditing = (editing && editing.isEditing) || false

        // DISPLAY
        switch (type) {
            case 'list': {
                return (
                    <ListWidget
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
                    <CardWidget
                        isEditing={isEditing}
                        isParentList={isParentList}
                        source={data || fromJS({})}
                        widget={updatedWidget}
                        editing={editing}
                    />
                )
            }
            case 'message': {
                return (
                    <div className={`ui message ${updatedWidget.getIn(['decoration', 'class'], '')}`}>
                        <p>{updatedWidget.get('title')}</p>
                    </div>
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
                            <a href={data} target="_blank">
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
            <FieldWidget
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
    widget: PropTypes.object.isRequired
}

export default InfobarWidget
