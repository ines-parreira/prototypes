/* InputColor
 */

import React, {Component, PropTypes} from 'react'

const colors = [
    '#f2484a', // red
    '#F2711C', // orange
    '#FBBD08', // yellow
    '#B5CC18', // olive
    '#2DCF57', // green
    '#00B5AD', // teal
    '#1c4969', // blue
    '#6435C9', // violet
    '#A333C8', // purple
    '#E03997', // pink
    '#A5673F', // brown
    '#767676' // grey
]

class InputColor extends Component {
    constructor(props) {
        super(props)

        this.state = {
            value: props.value || props.defaultValue || ''
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        })
    }

    componentDidMount() {
        $(this.refs.selectColor).popup({
            offset: -8,
            popup: $(this.refs.selectColorPopup),
            on: 'click',
            position: 'bottom left'
        })
    }

    setColor = (color) => {
        this.setState({
            value: color
        })

        $(this.refs.selectColor).popup('hide')
    }

    renderColorBtn = (color, key) => {
        const style = {
            backgroundColor: color
        }

        const _onClick = () => {
            this._onChange({
                target: {
                    value: color
                }
            })
        }

        return (
            <button type="button" style={style} onClick={_onClick} key={key}></button>
        )
    }

    _onChange = (e) => {
        if (this.props.onChange) {
            this.props.onChange(e)
        }

        this.setColor(e.target.value)
    }

    render() {
        const {value} = this.state

        const btnStyle = {
            background: value
        }

        return (
            <div className="ui input input-color">
                <button type="button" style={btnStyle} className="input-color-btn" ref="selectColor"></button>
                <input type="text" {...this.props} value={value} onChange={this._onChange} />

                <div className="ui popup input-color-popup" ref="selectColorPopup">
                    {colors.map(this.renderColorBtn)}
                </div>
            </div>
        )
    }
}

InputColor.propTypes = {
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    onChange: PropTypes.func
}

export default InputColor
