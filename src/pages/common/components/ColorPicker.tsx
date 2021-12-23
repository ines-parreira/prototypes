import React, {ChangeEvent, Component, MouseEvent} from 'react'
import _uniqueId from 'lodash/uniqueId'
import {Popover, PopoverBody, Input} from 'reactstrap'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import {DEFAULT_TAG_COLOR} from '../../../config'

import css from './ColorPicker.less'

const defaultColors = [
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

type Props = {
    value: string
    onChange: (value: string) => void
    colors: string[]
}

type State = {
    displayPopup: boolean
}

export default class ColorPicker extends Component<Props, State> {
    static defaultProps: Pick<Props, 'colors'> = {
        colors: defaultColors,
    }

    readonly uniqueId: string

    constructor(props: Props) {
        super(props)

        this.uniqueId = _uniqueId('color-picker-')

        this.state = {
            displayPopup: false,
        }
    }

    _handleClickChoice = (value: string) => {
        this.props.onChange(value)
        this._togglePopup()
    }

    _handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        this.props.onChange(value)
    }

    _togglePopup = (event?: MouseEvent) => {
        event?.preventDefault()
        this.setState({displayPopup: !this.state.displayPopup})
    }

    render() {
        const {value, colors} = this.props
        return (
            <div className="d-inline-block">
                <Button
                    id={this.uniqueId}
                    intent={ButtonIntent.Secondary}
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
                    trigger="legacy"
                >
                    <PopoverBody className={css['popover-content']}>
                        <div className={css.popup}>
                            {(colors || defaultColors).map((color) => {
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
