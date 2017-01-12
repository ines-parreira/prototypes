import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {fromJS} from 'immutable'
import {displayUserNameFromSource} from '../../../tickets/common/utils'
import {stripHTML} from '../../../../utils'
import {RenderLabel, TagLabel} from '../../../common/utils/labels'

export default class ComplexTableCell extends React.Component {
    _valueFieldContent = () => {
        const {field, viewType, item} = this.props
        const fieldName = field.get('name')

        switch (viewType) {
            case 'ticket-list': {
                switch (fieldName) {
                    case 'priority':
                        return item.get('priority')
                    case 'subject':
                        return item.get('subject')
                    case 'status':
                        return item.get('status')
                    case 'via':
                        return item.get('via')
                    case 'channel':
                        return item.get('channel')
                    case 'created':
                        return item.get('created_datetime')
                    case 'updated':
                        return item.get('updated_datetime')
                    case 'requester':
                        return item.get('requester') || fromJS({})
                    case 'assignee':
                        return item.get('assignee_user') || fromJS({})
                    case 'details': {
                        let subject = stripHTML(item.get('subject'))

                        // Optionally show how many messages a ticket has in the subject
                        const messageCount = item.get('messages_count')
                        if (messageCount > 1) {
                            subject = `(${messageCount}) ${subject}`
                        }

                        const body = item.get('excerpt')

                        if (!body) {
                            return (
                                <div className="ui header">
                                    <span className="subject">
                                        {subject}
                                    </span>
                                </div>
                            )
                        }
                        return (
                            <div className="ui header">
                                <span className="subject">
                                    {subject}
                                </span>
                                <div className="body sub header">
                                    {body}
                                </div>
                            </div>
                        )
                    }
                    case 'from': {
                        if (!item.get('first_source')) {
                            break
                        }

                        // get the part of "source" that we want
                        const source = item.getIn(['first_source', 'from'], fromJS({})).toJS()
                        // display the user based on the message type
                        return displayUserNameFromSource(source, item.getIn(['first_source', 'type']))
                    }
                    case 'to': {
                        // TODO get the matched channel,
                        // instead of the first one.
                        const firstChannel = item.getIn(['receiver', 'channels', 0])

                        if (!firstChannel) {
                            break
                        }

                        return firstChannel
                    }
                    case 'tags': {
                        return (
                            <div>
                                {
                                    item
                                        .get('tags', fromJS([]))
                                        .map((tag) => (
                                            <TagLabel
                                                key={`${item.get('id')}-${tag.get('id')}`}
                                                name={tag.get('name')}
                                            />
                                        ))
                                }
                            </div>
                        )
                    }
                    default: {
                        console.error('Invalid field type in complex table cell', fieldName)
                    }
                }
                break
            }
            case 'user-list': {
                switch (fieldName) {
                    case 'name':
                        return item.get('name')
                    case 'email':
                        return item.get('email')
                    case 'created':
                        return item.get('created_datetime')
                    case 'updated':
                        return item.get('updated_datetime')
                    case 'roles': {
                        return item.get('roles', fromJS([]))
                    }
                    default: {
                        console.error('Invalid field type in complex table cell', fieldName)
                    }
                }
                break
            }
            default:
                console.error('Invalid view type in complex table cell', viewType)
        }

        return item
    }

    render() {
        const {field, link, saveIndex} = this.props

        return (
            <Link
                to={link}
                className={`complex-list-table-col table-cell ${field.get('name')}`}
                onClick={saveIndex}
            >
                <RenderLabel
                    field={field}
                    value={this._valueFieldContent()}
                />
            </Link>
        )
    }
}

ComplexTableCell.propTypes = {
    link: PropTypes.string.isRequired,
    item: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    viewType: PropTypes.string.isRequired,
    saveIndex: PropTypes.func.isRequired,
}
