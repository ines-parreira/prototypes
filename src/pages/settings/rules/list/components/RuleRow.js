import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {Badge, Card, CardBlock} from 'reactstrap'

import ToggleCheckbox from '../../../../common/forms/ToggleCheckbox'

import RuleItem from '../../detail/components/RuleItem'

class RuleRow extends React.Component {
    _handleActivate = () => {
        const {actions, rule} = this.props
        actions.rules.activate(rule.get('id'))
    }

    _handleDeactivate = () => {
        const {actions, rule} = this.props

        if (confirm('Are you sure you want to deactivate this rule?')) {
            actions.rules.deactivate(rule.get('id'))
        }
    }

    _toggleItemStatus = (value) => {
        if (value) {
            this._handleActivate()
        } else {
            this._handleDeactivate()
        }
    }

    _renderClosed = () => {
        const {rule} = this.props

        return (
            <tr key={rule.get('id')}>
                <td className="link-full-td">
                    <a onClick={this.props.toggleOpening}>
                        <div>
                            <span className="mr-2">
                                <b>{rule.get('title')}</b>
                                {
                                    rule.get('type') === 'system' && (
                                        <Badge
                                            className="ml-2"
                                            color="danger"
                                        >
                                            <i className="fa fa-fw fa-exclamation-triangle mr-2" />
                                            SYSTEM
                                        </Badge>
                                    )
                                }
                            </span>
                            <span className="text-faded">
                                {rule.get('description')}
                            </span>
                        </div>
                    </a>
                </td>
                <td className="smallest align-middle">
                    <ToggleCheckbox
                        input={{
                            onChange: this._toggleItemStatus,
                            value: !rule.get('deactivated_datetime'),
                        }}
                    />
                </td>
            </tr>
        )
    }

    _renderOpened = () => {
        const {rule, actions} = this.props

        return (
            <tr key={rule.get('id')}>
                <td colSpan="100">
                    <Card>
                        <CardBlock>
                            <RuleItem
                                rule={rule}
                                actions={actions}
                                toggleOpening={this.props.toggleOpening}
                            />
                        </CardBlock>
                    </Card>
                </td>
            </tr>
        )
    }

    render() {
        if (this.props.isOpen) {
            return this._renderOpened()
        }

        return this._renderClosed()
    }
}

RuleRow.propTypes = {
    actions: PropTypes.object.isRequired,
    currentUser: PropTypes.object,
    rule: PropTypes.object.isRequired,
    toggleOpening: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
}

const mapStateToProps = (state) => ({
    currentUser: state.currentUser,
})

export default connect(mapStateToProps)(RuleRow)
