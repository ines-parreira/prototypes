import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {Input} from 'reactstrap'
import _noop from 'lodash/noop'

import css from './EditableTitle.less'

export default class EditableTitle extends React.Component {
    constructor(props) {
        super(props)
        this.state = this._stateProps(props)
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.props.select) {
                this._select()
            }
        }, 1)
    }

    componentWillReceiveProps(nextProps) {
        if (!this.state.editMode && this.state.value !== nextProps.title) {
            this.setState(this._stateProps(nextProps))

            setTimeout(() => {
                if (nextProps.select) {
                    this._select()
                } else {
                    this._blur()
                }
            }, 1)
        }
    }

    _select = () => {
        if (this.refs.title && this.refs.title.select) {
            this.refs.title.select()
        }
    }

    _blur = () => {
        if (this.refs.title && this.refs.title.blur) {
            this.refs.title.blur()
        }
    }

    _onKeyDown = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault()
        }
    }

    _onKeyUp = (e) => {
        if (e.keyCode === 13 || e.keyCode === 27) {
            e.preventDefault()

            this.setState({
                editMode: false
            })

            if (e.keyCode === 13) {
                this._blur()
            }
        }
    }

    _stateProps = (props) => ({
        value: props.title
    })

    _onChange = (e) => {
        const value = e.target.value
        this.setState({value})

        if (this.props.onChange) {
            this.props.onChange(value)
        }
    }

    _onBlur = ({target: {value}}) => {
        this.setState({editMode: false})
        this.props.update(value)
    }

    render() {
        const {className, size, placeholder, style} = this.props

        return (
            <Input
                innerRef="title"
                type="text"
                tabIndex="1"
                bsSize={size}
                style={style}
                disabled={this.props.disabled}
                className={classnames(className, css.component, {
                    [css['edit-mode']]: this.state.editMode || this.props.forceEditMode,
                })}

                placeholder={placeholder}
                autoFocus={this.props.focus}
                value={this.state.value}

                onChange={this._onChange}
                onFocus={() => this.setState({editMode: true})}
                onBlur={this._onBlur}
                onKeyUp={this._onKeyUp}
                onKeyDown={this._onKeyDown}
            />
        )
    }

}

EditableTitle.propTypes = {
    className: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    update: PropTypes.func.isRequired,
    focus: PropTypes.bool,
    select: PropTypes.bool,
    size: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    style: PropTypes.object.isRequired,
    forceEditMode: PropTypes.bool,
    onChange: PropTypes.func
}


EditableTitle.defaultProps = {
    className: '',
    update: _noop,
    style: {},
    size: 'xl',
}
