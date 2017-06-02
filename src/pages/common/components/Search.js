import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import {Input, InputGroup, InputGroupAddon} from 'reactstrap'
import _debounce from 'lodash/debounce'
import _isUndefined from 'lodash/isUndefined'

import shortcutManager from '../utils/shortcutManager'

import css from './Search.less'

export default class Search extends React.Component {
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
                        ReactDOM.findDOMNode(this.refs.searchInput).focus()
                    }
                }
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        const shouldSetValue = !this.isInitialized || (
                nextProps.location &&
                this.props.location !== nextProps.location
            )

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
    }, this.props.searchDebounceTime || 200)

    _handleChange = (search) => {
        this.setState({search})
        return this._debouncedSearch()
    }

    render() {
        const {disabled, style} = this.props

        return (
            <div
                className={classnames(css.component, this.props.className)}
                style={style}
            >
                <InputGroup>
                    <Input
                        ref="searchInput"
                        type="text"
                        className={css.input}
                        placeholder={this.props.placeholder}
                        value={this.state.search}
                        onChange={e => this._handleChange(e.target.value)}
                        autoFocus={this.props.autofocus}
                        disabled={disabled}
                        style={{zIndex: 1}} // override the zIndex 2 of Bootstrap .form-control class
                    />
                    <InputGroupAddon className="hidden-sm-down">
                        <i className="fa fa-fw fa-search" />
                    </InputGroupAddon>
                </InputGroup>
            </div>
        )
    }
}

Search.propTypes = {
    onChange: PropTypes.func.isRequired,
    params: PropTypes.object,
    forcedQuery: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    shouldResetInput: PropTypes.bool,
    disabled: PropTypes.bool,

    className: PropTypes.string,
    placeholder: PropTypes.string,
    autofocus: PropTypes.bool,
    bindKey: PropTypes.bool,
    searchDebounceTime: PropTypes.number,

    // location is an identifier, if it changes it's like if the Search unmounted then mounted again (ex: changing page)
    location: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    style: PropTypes.object.isRequired,
}

Search.defaultProps = {
    disabled: false,
    placeholder: 'Search...',
    style: {},
}
