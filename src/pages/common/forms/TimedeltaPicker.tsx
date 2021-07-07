import React, {Component} from 'react'
import _find from 'lodash/find'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    InputGroup,
    InputGroupButtonDropdown,
} from 'reactstrap'

import {isTimedelta} from '../../../utils/ast'
import {
    TIMEDELTA_OPERATOR_DEFAULT_QUANTITY,
    TIMEDELTA_OPERATOR_DEFAULT_UNIT,
} from '../../../config'

type Unit = {
    label: string
    value: string
}

type Props = {
    value: string
    onChange: (value: string) => void
    units?: Array<Unit>
}

type State = {
    quantity: number
    unit: string
    dropdownOpen: boolean
    units: Array<Unit>
}

const UNITS = [
    {label: 'minute(s) ago', value: 'm'},
    {label: 'hour(s) ago', value: 'h'},
    {label: 'day(s) ago', value: 'd'},
    {label: 'week(s) ago', value: 'w'},
]

const MAX_QUANTITY = 9999

export default class TimedeltaPicker extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        const {value} = this.props
        const units = this.props.units ? this.props.units : UNITS

        if (isTimedelta(value)) {
            this.state = {
                ...this._buildValue(value),
                dropdownOpen: false,
                units: units,
            }
        } else {
            this.state = {
                quantity: TIMEDELTA_OPERATOR_DEFAULT_QUANTITY,
                unit: TIMEDELTA_OPERATOR_DEFAULT_UNIT,
                dropdownOpen: false,
                units: units,
            }
        }
    }

    componentWillReceiveProps = (nextProps: Props) => {
        if (isTimedelta(nextProps.value)) {
            this.setState(this._buildValue(nextProps.value))
        }
    }

    _buildValue = (value?: string) => {
        const quantity = value
            ? parseInt(value.replace(/[^\d]/g, ''))
            : TIMEDELTA_OPERATOR_DEFAULT_QUANTITY
        const unit = value
            ? value.replace(/[\d]/g, '')
            : TIMEDELTA_OPERATOR_DEFAULT_UNIT

        return {quantity, unit}
    }

    _onChange = (quantity: number, unit: string) => {
        this.props.onChange(`${quantity}${unit}`)
    }

    _onUnitChange = (unit: string) => {
        this.setState({unit})
        this._onChange(this.state.quantity, unit)
    }

    _onQuantityChange = (quantity: number) => {
        if (quantity > MAX_QUANTITY) {
            return
        }

        this.setState({quantity})
        this._onChange(quantity, this.state.unit)
    }

    _toggleDropdown = () => {
        this.setState({dropdownOpen: !this.state.dropdownOpen})
    }

    render() {
        // $FlowFixMe
        const unitLabel = _find(
            this.state.units,
            (unit) => unit.value === this.state.unit
        )?.label

        return (
            <div className="d-flex">
                <InputGroup>
                    <Input
                        type="number"
                        value={this.state.quantity}
                        onChange={(event) =>
                            this._onQuantityChange(event.target.value as any)
                        }
                        style={{width: '62px'}}
                        min="0"
                        max={MAX_QUANTITY}
                        required
                    />
                    <InputGroupButtonDropdown
                        addonType="append"
                        isOpen={this.state.dropdownOpen}
                        toggle={this._toggleDropdown}
                    >
                        <DropdownToggle caret>
                            <span>{unitLabel}</span>
                        </DropdownToggle>
                        <DropdownMenu>
                            {this.state.units.map((unit) => {
                                return (
                                    <DropdownItem
                                        key={unit.value}
                                        onClick={() =>
                                            this._onUnitChange(unit.value)
                                        }
                                    >
                                        {unit.label}
                                    </DropdownItem>
                                )
                            })}
                        </DropdownMenu>
                    </InputGroupButtonDropdown>
                </InputGroup>
            </div>
        )
    }
}
