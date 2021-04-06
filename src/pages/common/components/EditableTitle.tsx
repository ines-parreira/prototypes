import React, {
    CSSProperties,
    Component,
    KeyboardEvent,
    ChangeEvent,
    FocusEvent,
} from 'react'
import classnames from 'classnames'
import {Input, InputProps} from 'reactstrap'
import _noop from 'lodash/noop'

import css from './EditableTitle.less'

type Props = {
    className: string
    title: string
    placeholder?: string
    update: (value: string) => void
    focus?: boolean
    select?: boolean
    size: InputProps['bsSize']
    disabled?: boolean
    style: CSSProperties
    forceEditMode?: boolean
    onChange?: (value?: string) => void
}

type State = {
    editMode: boolean
    value: string
}
export default class EditableTitle extends Component<Props, State> {
    static defaultProps: Pick<
        Props,
        'className' | 'update' | 'style' | 'size'
    > = {
        className: '',
        update: _noop,
        style: {},
        size: 'xl' as InputProps['bsSize'],
    }

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

    _select = () => {
        // eslint-disable-next-line react/no-string-refs
        const titleRef = this.refs.title
        //@ts-ignore
        if (titleRef && titleRef.select) {
            //@ts-ignore
            titleRef.select() // eslint-disable-line
        }
    }

    _blur = () => {
        // eslint-disable-next-line react/no-string-refs
        const titleRef = this.refs.title
        //@ts-ignore
        if (titleRef && titleRef.blur) {
            //@ts-ignore
            titleRef.blur() // eslint-disable-line
        }
    }

    _onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === 13) {
            e.preventDefault()
        }
    }

    _onKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === 13 || e.keyCode === 27) {
            e.preventDefault()

            this.setState({
                editMode: false,
            })

            if (e.keyCode === 13) {
                this._blur()
            }
        }
    }

    _onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
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
        const {className, size, placeholder, style} = this.props

        return (
            <Input
                //@ts-ignore
                innerRef="title"
                type="text"
                tabIndex={1}
                bsSize={size}
                style={style}
                disabled={this.props.disabled}
                className={classnames(className, css.component, {
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
