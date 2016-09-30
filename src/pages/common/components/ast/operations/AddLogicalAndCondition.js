import React from 'react'

import classNames from 'classnames'

import Hoverable from '../../Hoverable'

class AddLogicalAndCondition extends React.Component {

    _handleClick = () => {
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

        const { actions, index, parent } = this.props
        actions.rules.modifyCodeast(index, parent, actionNode, 'UPDATE_LOGICAL_AND')
    }

    render() {
        const { title } = this.props
        const { hovered } = this.context
        const buttonClassName = classNames('ui inline keyword', { icon: hovered }, 'button')
        return (
            <button className={buttonClassName} onClick={this._handleClick}>
                {
                    !hovered
                        ? title
                        : <i className="fitted large plus icon" />
                }
            </button>
        )
    }
}

AddLogicalAndCondition.propTypes = {
    actions: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    parent: React.PropTypes.object.isRequired,
    title: React.PropTypes.string.isRequired,
}

AddLogicalAndCondition.contextTypes = {
    hovered: React.PropTypes.bool,
}

export default Hoverable(AddLogicalAndCondition)
