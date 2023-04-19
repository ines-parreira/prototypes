import React, {Component, createRef, FocusEvent, KeyboardEvent} from 'react'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import TextInput from 'pages/common/forms/input/TextInput'
import css from './EditableTitle.less'

type Props = {
    className: string
    title: string
    placeholder?: string
    update: (value: string) => void
    focus?: boolean
    select?: boolean
    disabled?: boolean
    forceEditMode?: boolean
    onChange?: (value?: string) => void
}

type State = {
    editMode: boolean
    value: string
}
export default class EditableTitle extends Component<Props, State> {
    static defaultProps: Pick<Props, 'className' | 'update'> = {
        className: '',
        update: _noop,
    }
    ref = createRef<HTMLInputElement>()

    constructor(props: Props) {
        super(props)
        this.state = {
            value: props.title,
            editMode: false,
        }
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.props.select) {
                this._select()
            }
        }, 1)
    }

    componentWillReceiveProps(nextProps: Props) {
        if (!this.state.editMode && this.state.value !== nextProps.title) {
            this.setState({value: nextProps.title})

            setTimeout(() => {
                if (nextProps.select) {
                    this._select()
                } else {
                    this._blur()
                }
            }, 1)
        }
    }

    _select = () => this.ref?.current?.select()

    _blur = () => this.ref?.current?.blur()

    _onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
        }
    }

    _onKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault()

            this.setState({
                editMode: false,
            })

            if (e.key === 'Enter') {
                this._blur()
            }
        }
    }

    _onChange = (value: string) => {
        this.setState({value})

        if (this.props.onChange) {
            this.props.onChange(value)
        }
    }

    _onBlur = ({target: {value}}: FocusEvent<HTMLInputElement>) => {
        this.setState({editMode: false})
        this.props.update(value)
    }

    render() {
        const {className, placeholder} = this.props

        return (
            <TextInput
                className={classnames(css.component, {
                    [css['edit-mode']]:
                        this.state.editMode || this.props.forceEditMode,
                    [css.isDisabled]: this.props.disabled,
                })}
                ref={this.ref}
                tabIndex={1}
                isDisabled={this.props.disabled}
                inputClassName={classnames(className, css.input, {
                    [css['edit-mode']]:
                        this.state.editMode || this.props.forceEditMode,
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
