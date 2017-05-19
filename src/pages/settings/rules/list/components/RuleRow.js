import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {Button, Badge, Card, CardBlock} from 'reactstrap'

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
                <td className="align-center align-middle">
                    <div>
                        <a onClick={this.props.toggleOpening}>
                            <b>{rule.get('title')}</b>
                        </a>
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
                    </div>
                    <a
                        className="text-faded"
                        onClick={this.props.toggleOpening}
                    >
                        {rule.get('description')}
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
                <td className="smallest align-middle">
                    <div className="pull-right">
                        <Button
                            type="submit"
                            color="info"
                            onClick={this.props.toggleOpening}
                        >
                            Edit
                        </Button>
                    </div>
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
