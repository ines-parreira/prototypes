import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {Badge, Card, CardBlock, Button, Popover, PopoverTitle, PopoverContent} from 'reactstrap'

import ToggleButton from '../../../../common/components/ToggleButton'

import RuleItem from '../../detail/components/RuleItem'

class RuleRow extends React.Component {
    state = {
        showConfirmation: false
    }

    _toggleConfirmation = () => {
        this.setState({showConfirmation: !this.state.showConfirmation})
    }

    _handleActivate = () => {
        const {actions, rule} = this.props
        actions.rules.activate(rule.get('id'))
    }

    _handleDeactivate = () => {
        const {actions, rule} = this.props

        actions.rules.deactivate(rule.get('id'))
        this._toggleConfirmation()
    }

    _toggleItemStatus = () => {
        const checked = !!this.props.rule.get('deactivated_datetime')
        if (checked) {
            this._handleActivate()
        } else {
            this._toggleConfirmation()
        }
    }

    _renderClosed = () => {
        const {rule} = this.props
        const {showConfirmation} = this.state
        const toggleId = `rule-toggle-${rule.get('id')}`

        return (
            <tr
                key={rule.get('id')}
                data-id={rule.get('id')} // dragging info
                className="draggable"
            >
                <td className="smallest align-middle">
                    <i
                        className="fa fa-fw fa-bars fa-lg text-faded drag-handle"
                        style={{cursor: 'move'}}
                    />
                </td>
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
                    <div id={toggleId}>
                        <ToggleButton
                            value={!rule.get('deactivated_datetime')}
                            onChange={this._toggleItemStatus}
                        />
                    </div>
                    <Popover
                        placement="left"
                        isOpen={showConfirmation}
                        target={toggleId}
                        toggle={this._toggleConfirmation}
                    >
                        <PopoverTitle>
                            Are you sure?
                        </PopoverTitle>
                        <PopoverContent>
                            <p>
                                Are you sure you want to deactivate this rule?
                            </p>

                            <Button
                                type="submit"
                                color="success"
                                onClick={this._handleDeactivate}
                            >
                                Confirm
                            </Button>
                        </PopoverContent>
                    </Popover>
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
