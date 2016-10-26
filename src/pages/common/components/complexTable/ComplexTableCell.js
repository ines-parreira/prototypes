import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {displayUserNameFromSource} from '../../../tickets/common/utils'
import {stripHTML, lastMessage as getLastMessage, firstMessage as getFirstMessage} from '../../../../utils'
import {RenderLabel, TagLabel} from '../../../common/utils/labels'
import _get from 'lodash/get'

export default class ComplexTableCell extends React.Component {
    _renderFieldContent = () => {
        const {item} = this.props
        const field = this.props.field.toJS()
        let value

        // customize values of some fields
        switch (field.type) {
            case 'agent':
            case 'user': {
                // ticket.requester.id => ticket.requester
                value = item.getIn(field.name.split('.').slice(0, -1))
                if (value) {
                    value = value.toJS()
                }
                break
            }
            case 'tags': {
                return item.get('tags').map((tag) => (
                    <TagLabel
                        key={`${item.get('id')}-${tag.get('id')}`}
                        tag={tag.toJS()}
                    />
                )).toJS()
            }
            case 'roles': {
                let label
                const userRoles = item
                    .get('roles', fromJS([]))
                    .map((v) => v.get('name'))

                if (userRoles.includes('staff')) {
                    label = <div className="ui red smaller label">Staff</div>
                } else if (userRoles.includes('admin')) {
                    label = <div className="ui blue smaller label">Admin</div>
                } else if (userRoles.includes('agent')) {
                    label = <div className="ui yellow smaller label">Agent</div>
                } else {
                    label = <div className="ui grey smaller label">User</div>
                }

                return label
            }
            // ticket message address
            case 'address': {
                if (field.name.startsWith('messages')) {
                    const firstMessage = getFirstMessage(item.get('messages', fromJS([])).toJS())

                    if (!firstMessage) {
                        break
                    }

                    const path = field.name.split('.')
                    // remove "messages", lets keep the last message as the message we want to use
                    path.shift()

                    // "to" is an array so we want the first element in it
                    if (path.includes('to')) {
                        path.splice(path.indexOf('to') + 1, 0, 0)
                    }

                    // remove the "address" property, it depends actually on the type of the message
                    if (field.name.endsWith('address')) {
                        path.pop()
                    }

                    // get the part of "source" that we want
                    value = _get(firstMessage, path, '')
                    // display the user based on the message type
                    value = displayUserNameFromSource(value, firstMessage.source.type)
                }
                break
            }
            case 'composite': {
                if (field.name === 'ticket-details') {
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

                    value = (
                        <div className="ui header">
                            <span className="subject">
                                {subject}
                            </span>
                            <div className="body sub header">
                                {body}
                            </div>
                        </div>
                    )
                } else {
                    console.error('Invalid composite field in view', field)
                }
                break
            }
            default: {
                value = item.getIn(field.name.split('.'))
            }
        }

        return RenderLabel(field, value, this.props.currentUser.get('timezone'))
    }

    render() {
        const {field} = this.props

        return (
            <td className={`${field.get('name')} table-cell`}>
                {this._renderFieldContent()}
            </td>
        )
    }
}

ComplexTableCell.propTypes = {
    item: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
}
