import React, {
    CSSProperties,
    Component,
    KeyboardEvent,
    InputHTMLAttributes,
    RefObject,
} from 'react'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import _isUndefined from 'lodash/isUndefined'

import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import shortcutManager from 'services/shortcutManager/shortcutManager'

import css from './Search.less'

type Props = {
    onChange?: (searchQuery: string) => void
    onKeyDown?: (event: KeyboardEvent, searchQuery: string) => void
    onFocus?: () => void
    forcedQuery?: string
    shouldResetInput?: boolean
    disabled: boolean
    autoFocus?: boolean
    className?: string
    textInputClassName?: string
    placeholder: string
    bindKey?: boolean
    searchDebounceTime: number
    // location is an identifier, if it changes it's like if the Search unmounted then mounted again (ex: changing page)
    location?: string
    style: CSSProperties
    externalInputRef?: RefObject<HTMLInputElement>
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onKeyDown'>

export default class Search extends Component<Props> {
    private isInitialized: boolean

    searchInputRef: Maybe<HTMLInputElement>

    static defaultProps: Pick<
        Props,
        'disabled' | 'placeholder' | 'style' | 'searchDebounceTime'
    > = {
        disabled: false,
        placeholder: 'Search...',
        style: {},
        searchDebounceTime: 0,
    }

    state = {
        search: '',
    }

    constructor(props: Props) {
        super(props)

        this.isInitialized = false

        this.state = {
            search: props.forcedQuery || '',
        }
    }

    componentDidMount() {
        if (this.props.bindKey) {
            shortcutManager.bind('Search', {
                FOCUS_SEARCH: {
                    action: (e) => {
                        e.preventDefault()
                        const ref =
                            this.props.externalInputRef?.current ||
                            this.searchInputRef
                        ref?.focus()
                    },
                },
            })
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        const shouldSetValue =
            !this.isInitialized ||
            (nextProps.location && this.props.location !== nextProps.location)

        if (shouldSetValue) {
            this.setState({search: ''})

            if (!_isUndefined(nextProps.forcedQuery)) {
                this.setState({search: nextProps.forcedQuery || ''})
            }

            if (nextProps.forcedQuery) {
                // `this._debouncedSearch()` is not necessary in the ticket-list context, but I think it's better for
                // consistency that it gets executed anytime we force a query.
                this._debouncedSearch()
            }

            this.isInitialized = true
        }

        if (!this.props.shouldResetInput && nextProps.shouldResetInput) {
            this.setState({search: ''})
        }
    }

    componentWillUnmount() {
        if (this.props.bindKey) {
            shortcutManager.unbind('Search')
        }
    }

    // search every XXXms
    _debouncedSearch = _debounce(() => {
        const {onChange} = this.props
        if (onChange) {
            return onChange(this.state.search)
        }
    }, this.props.searchDebounceTime)

    _handleChange = (search: string) => {
        this.setState({search})
        return this._debouncedSearch()
    }

    _reset = () => {
        return this._handleChange('')
    }

    handleKeyDown = (e: KeyboardEvent) => {
        const {onKeyDown} = this.props
        const {search} = this.state
        const ref = this.props.externalInputRef?.current || this.searchInputRef

        if (onKeyDown) {
            onKeyDown(e, search)
        }
        if (e.key === 'Escape' && ref) {
            ref.blur()
        }
    }

    render() {
        const {
            style,
            className,
            textInputClassName,
            onChange, // eslint-disable-line
            forcedQuery, // eslint-disable-line
            shouldResetInput, // eslint-disable-line
            bindKey, // eslint-disable-line
            searchDebounceTime, // eslint-disable-line
            location, // eslint-disable-line
            type,
            externalInputRef,
            ...rest
        } = this.props

        return (
            <div className={classnames(css.component, className)} style={style}>
                <TextInput
                    ref={
                        externalInputRef ||
                        ((ref) => (this.searchInputRef = ref))
                    }
                    type={type}
                    className={classnames(css.input, textInputClassName)}
                    value={this.state.search}
                    onChange={(value) => this._handleChange(value)}
                    prefix={<IconInput icon="search" />}
                    {...rest}
                    onKeyDown={this.handleKeyDown}
                />
            </div>
        )
    }
}
