import React, {PropTypes} from 'react'
import classnames from 'classnames'

export default class EditableTitle extends React.Component {
    constructor(props) {
        super(props)
        this.state = this._stateProps(props)
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.value !== nextProps.title) {
            this.setState(this._stateProps(nextProps))
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
                this.refs.title.blur()
            }
        }
    }

    _stateProps = (props) => ({
        value: props.title,
        editMode: !props.title,
    })

    _onChange = (e) => {
        this.setState({value: e.target.value})
    }

    _onBlur = (e) => {
        const {value} = e.target
        if (value) {
            this.setState({editMode: false})
        }
        this.props.update(value)
    }

    render() {
        const {placeholder} = this.props
        const className = classnames('ui header EditableTitle', {
            'edit-mode': this.state.editMode
        })

        return (
            <input
                ref="title"
                type="text"
                tabIndex="1"
                style={this.props.style}
                className={className}

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
    title: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    update: PropTypes.func.isRequired,
    focus: PropTypes.bool,
    style: PropTypes.object
}
