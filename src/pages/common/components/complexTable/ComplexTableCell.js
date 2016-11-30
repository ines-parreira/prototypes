import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {displayUserNameFromSource} from '../../../tickets/common/utils'
import {stripHTML, lastMessage as getLastMessage, firstMessage as getFirstMessage} from '../../../../utils'
import {RenderLabel, TagLabel} from '../../../common/utils/labels'
import _get from 'lodash/get'

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
                        const previewedMessage = getLastMessage(item.get('messages', fromJS([])).toJS())

                        if (!previewedMessage) {
                            break
                        }

                        // Optionally show how many messages a ticket has in the subject
                        let subject = stripHTML(item.get('subject'))
                        const messageCount = this.props.item.get('messages').size
                        if (messageCount > 1) {
                            subject = `(${messageCount}) ${subject}`
                        }

                        const body = previewedMessage.body_html
                            ? stripHTML(previewedMessage.body_html)
                            : previewedMessage.body_text

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
                        const firstMessage = getFirstMessage(item.get('messages', fromJS([])).toJS())

                        if (!firstMessage) {
                            break
                        }

                        const path = 'source.from'

                        // get the part of "source" that we want
                        const source = _get(firstMessage, path, '')
                        // display the user based on the message type
                        return displayUserNameFromSource(source, firstMessage.source.type)
                    }
                    case 'to': {
                        const firstMessage = getFirstMessage(item.get('messages', fromJS([])).toJS())

                        if (!firstMessage) {
                            break
                        }

                        const path = 'source.to.0'

                        // get the part of "source" that we want
                        const source = _get(firstMessage, path, '')
                        // display the user based on the message type
                        return displayUserNameFromSource(source, firstMessage.source.type)
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
        const {field} = this.props

        return (
            <td className={`table-cell ${field.get('name')}`}>
                <RenderLabel
                    field={field}
                    value={this._valueFieldContent()}
                />
            </td>
        )
    }
}

ComplexTableCell.propTypes = {
    item: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    viewType: PropTypes.string.isRequired,
}
