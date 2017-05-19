import React, {PropTypes} from 'react'
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Badge,
} from 'reactstrap'

import * as rulesConfig from '../../../../../config/rules'

export default class TriggersSelector extends React.Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        triggers: PropTypes.array.isRequired,
    }

    render() {
        const selectedTriggers = rulesConfig.triggers
            .filter(trigger => this.props.triggers.includes(trigger.event))

        const remainingTriggers = rulesConfig.triggers
            .filter(trigger => !this.props.triggers.includes(trigger.event))

        return (
            <div className="d-inline-flex align-items-center flex-wrap">
                {
                    selectedTriggers.map((trigger, i) => {
                        const {event, name} = trigger

                        return [
                            <Badge
                                className="tag"
                                style={{color: '#0275d8'}}
                                key={name}
                            >
                                <span>
                                    {name}
                                    <i
                                        className="fa fa-fw fa-close cursor-pointer ml-1"
                                        onClick={() => this.props.onChange(event)}
                                    />
                                </span>
                            </Badge>,
                            <div key={`${name}-or`}>
                                {i < selectedTriggers.length - 1 && <div className="d-inline ml-2 mr-2">or</div>}
                            </div>
                        ]
                    })
                }
                {
                    remainingTriggers.length > 0 && (
                        <UncontrolledDropdown className="d-inline-block">
                            <DropdownToggle
                                color="link"
                                type="button"
                                className="mr-1 ml-1 d-inline-flex align-items-center"
                                style={{padding: 0}}
                            >
                                <i className="fa fa-fw fa-plus mr-1" />
                                {selectedTriggers.length === 0 && 'Select a trigger'}
                            </DropdownToggle>
                            <DropdownMenu>
                                {
                                    remainingTriggers.map((trigger) => {
                                        const {event, name} = trigger

                                        return (
                                            <DropdownItem
                                                key={event}
                                                type="button"
                                                onClick={() => this.props.onChange(event)}
                                            >
                                                {name}
                                            </DropdownItem>
                                        )
                                    })
                                }
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    )
                }
            </div>
        )
    }
}
