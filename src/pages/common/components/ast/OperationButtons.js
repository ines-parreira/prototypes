import React from 'react'

// Add a new line in the code.
export class AddLine extends React.Component {
    render() {
        const {parent, index, actions} = this.props

        if (parent.contains('test')) {
            return (
                <AddLogicalAndCondition
                    parent={parent}
                    index={index}
                    actions={actions}
                />
            )
        }

        return (
            <div className="AddLine ui blue icon mini dropdown button">
                <i className="plus icon"/>
                <div className="menu">
                    <div className="header">Insert new line</div>
                    <div className="item">
                        <AddAction
                            parent={parent}
                            index={index}
                            actions={actions}
                        />
                    </div>
                    <div className="item">
                        <AddIf
                            parent={parent}
                            index={index}
                            actions={actions}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

class AddLogicalAndCondition extends React.Component {
    handleClick(event) {
        const actionNode = {
            type: 'LogicalExpression',
            operator: '&&',
            left: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'equal'
                },
                arguments: [
                    {
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                            type: 'Identifier',
                            name: 'ticket'
                        },
                        property: {
                            type: 'Identifier',
                            name: 'status'
                        }
                    },
                    {
                        type: 'Literal',
                        value: 'open',
                        raw: '\'open\''
                    }
                ],
            },
            right: null,
        }

        const {parent, actions, index} = this.props
        actions.modifyCodeast(index, parent, actionNode, 'UPDATE_LOGICAL_AND')
    }

    render() {
        return (
            <button className="AddLine ui blue icon mini dropdown button" onClick={this.handleClick.bind(this)}>
                <i className="plus icon"></i>
            </button>
        )
    }
}

class AddAction extends React.Component {
    handleClick(event) {
        const actionNode = {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'Action'
                },
                arguments: [
                    {
                        type: 'Identifier',
                        name: 'list_of_actions'
                    },
                    {
                        type: 'Literal',
                        value: 'action_send_email_notification',
                        raw: '\'action_send_email_notification\''
                    },
                    {
                        type: 'ObjectExpression',
                        'properties': [
                            {
                                type: 'Property',
                                key: {
                                    type: 'Identifier',
                                    name: 'to'
                                },
                                computed: false,
                                value: {
                                    type: 'Literal',
                                    value: 'user@email.com',
                                    raw: '\'user@email.com\''
                                },
                                kind: 'init',
                                method: false,
                                shorthand: false
                            },
                            {
                                type: 'Property',
                                key: {
                                    type: 'Identifier',
                                    name: 'subject'
                                },
                                computed: false,
                                value: {
                                    type: 'Literal',
                                    value: 'Hello Gorgias',
                                    raw: '\'Hello Gorgias\''
                                },
                                kind: 'init',
                                method: false,
                                shorthand: false
                            },
                            {
                                type: 'Property',
                                key: {
                                    type: 'Identifier',
                                    name: 'body'
                                },
                                computed: false,
                                value: {
                                    type: 'Literal',
                                    value: '42',
                                    raw: '\'42\''
                                },
                                kind: 'init',
                                method: false,
                                shorthand: false
                            }
                        ]
                    }
                ]
            }
        }

        const {parent, actions, index} = this.props
        actions.modifyCodeast(index, parent, actionNode, 'INSERT')
    }

    render() {
        const options = [
            {
                label: 'Send notification email to user',
                value: 'send_notification_to_user'
            },
            {
                label: 'Add tag to the ticket',
                value: 'action_add_tag_to_ticket'
            }
        ]
        return (
            <span onClick={this.handleClick.bind(this)} options={options}>Action</span>
        )
    }
}

class AddIf extends React.Component {
    handleClick(event) {
        const actionNode = {
            type: 'IfStatement',
            test: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'equal'
                },
                arguments: [
                    {
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                            type: 'Identifier',
                            name: 'ticket'
                        },
                        property: {
                            type: 'Identifier',
                            name: 'status'
                        }
                    },
                    {
                        type: 'Literal',
                        value: 'open',
                        raw: '\'open\''
                    }
                ],
            },
            consequent: {
                type: 'BlockStatement',
                body: []
            },
            alternate: {
                type: 'BlockStatement',
                body: []
            }
        }

        const {parent, actions, index} = this.props
        actions.modifyCodeast(index, parent, actionNode, 'INSERT')
    }

    render() {
        return (
            <span onClick={this.handleClick.bind(this)}>IF statement</span>
        )
    }
}

export class DeleteBinaryExpression extends React.Component {
    handleClick(event) {
        const {parent, actions, index} = this.props
        actions.modifyCodeast(index, parent, null, 'DELETE_BINARY_EXPRESSION')
    }

    render() {
        return (
            <button className="ui circular red mini icon button delete-binaryexpression"
                    onClick={this.handleClick.bind(this)}>
                &times;
            </button>
        )
    }
}

export class DeleteBlockStatementItem extends React.Component {
    handleClick(event) {
        const {parent, actions, index} = this.props
        actions.modifyCodeast(index, parent, null, 'DELETE')
    }

    render() {
        return (
            <button
                className="ui circular red mini icon button delete-blockstatement"
                onClick={this.handleClick.bind(this)}>&times;</button>
        )
    }
}