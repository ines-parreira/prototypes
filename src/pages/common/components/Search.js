import React, {type Element} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import {Input} from 'reactstrap'
import _debounce from 'lodash/debounce'
import _isUndefined from 'lodash/isUndefined'

import shortcutManager from '../../../services/shortcutManager'

import css from './Search.less'

export default class Search extends React.Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        onKeyDown: PropTypes.func,
        params: PropTypes.object,
        forcedQuery: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        shouldResetInput: PropTypes.bool,
        disabled: PropTypes.bool,

        className: PropTypes.string,
        placeholder: PropTypes.string,
        bindKey: PropTypes.bool,
        searchDebounceTime: PropTypes.number.isRequired,

        // location is an identifier, if it changes it's like if the Search unmounted then mounted again (ex: changing page)
        location: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        style: PropTypes.object.isRequired,
    }

    searchInputRef: ?Element<typeof Input>

    static defaultProps = {
        disabled: false,
        placeholder: 'Search...',
        style: {},
        searchDebounceTime: 0,
    }

    state = {
        search: '',
    }

    constructor(props) {
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
                        ReactDOM.findDOMNode(this.searchInputRef).focus()
                    },
                },
            })
        }
    }

    componentWillReceiveProps(nextProps) {
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
        return this.props.onChange(this.state.search)
    }, this.props.searchDebounceTime)

    _handleChange = (search) => {
        this.setState({search})
        return this._debouncedSearch()
    }

    _reset = () => {
        return this._handleChange('')
    }

    handleKeyDown = (e) => {
        const {onKeyDown} = this.props
        if (onKeyDown) {
            onKeyDown(e)
        }
        if (e.key === 'Escape' && this.searchInputRef) {
            ReactDOM.findDOMNode(this.searchInputRef).blur()
        }
    }

    render() {
        const {
            style,
            className,
            onChange, // eslint-disable-line
            params, // eslint-disable-line
            forcedQuery, // eslint-disable-line
            shouldResetInput, // eslint-disable-line
            bindKey, // eslint-disable-line
            searchDebounceTime, // eslint-disable-line
            location, // eslint-disable-line
            ...rest
        } = this.props

        return (
            <div
                className={classnames(css.component, 'input-icon', className)}
                style={style}
            >
                <i className={classnames(css.icon, 'icon material-icons md-2')}>
                    search
                </i>
                <Input
                    ref={(ref) => (this.searchInputRef = ref)}
                    type="text"
                    className={css.input}
                    value={this.state.search}
                    onChange={(e) => this._handleChange(e.target.value)}
                    style={{zIndex: 1}} // override the zIndex 2 of Bootstrap .form-control class
                    {...rest}
                    onKeyDown={this.handleKeyDown}
                />
            </div>
        )
    }
}
