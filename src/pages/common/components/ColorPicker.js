import React, {Component} from 'react'
import PropTypes from 'prop-types'
import _uniqueId from 'lodash/uniqueId'
import {Button, Popover, PopoverBody, Input} from 'reactstrap'

import {DEFAULT_TAG_COLOR} from '../../../config'

import css from './ColorPicker.less'

const colors = [
    '#EB144C', // red
    '#FF6900', // orange
    '#FCB900', // yellow
    '#B5CC18', // olive
    '#00D084', // green
    '#7BDCB5', // teal
    '#8ED1FC', // light blue
    '#0693E3', // blue
    '#9900EF', // purple
    '#E03997', // pink
    '#F78DA7', // light pink
    '#A5673F', // brown
    '#ABB8C3', // light grey
    '#767676', // grey
]

export default class ColorPicker extends Component {
    static propTypes = {
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        colors: PropTypes.array.isRequired,
    }

    static defaultProps = {
        colors,
    }

    constructor(props) {
        super(props)

        this.uniqueId = _uniqueId('color-picker-')

        this.state = {
            displayPopup: false,
        }
    }

    _handleClickChoice = (value) => {
        this.props.onChange(value)
        this._togglePopup()
    }

    _handleChange = (e) => {
        const value = e.target.value
        this.props.onChange(value)
    }

    _togglePopup = () => {
        this.setState({displayPopup: !this.state.displayPopup})
    }

    render() {
        const {value} = this.props
        return (
            <div className="d-inline-block">
                <Button
                    id={this.uniqueId}
                    type="button"
                    color="secondary"
                    className={css.button}
                    onClick={this._togglePopup}
                >
                    <div
                        className={css.color}
                        style={{
                            backgroundColor: value || DEFAULT_TAG_COLOR,
                        }}
                    />
                </Button>
                <Popover
                    placement="right"
                    isOpen={this.state.displayPopup}
                    target={this.uniqueId}
                    toggle={this._togglePopup}
                >
                    <PopoverBody className={css['popover-content']}>
                        <div className={css.popup}>
                            {colors.map((color) => {
                                return (
                                    <div
                                        key={color}
                                        className={css.choice}
                                        style={{
                                            backgroundColor: color,
                                        }}
                                        onClick={() =>
                                            this._handleClickChoice(color)
                                        }
                                    />
                                )
                            })}
                            <Input
                                bsSize="sm"
                                className={css.input}
                                value={value}
                                onChange={this._handleChange}
                                placeholder="ex: #eeeeee"
                            />
                        </div>
                    </PopoverBody>
                </Popover>
            </div>
        )
    }
}
