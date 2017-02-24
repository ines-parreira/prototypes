import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import _debounce from 'lodash/debounce'
import _isUndefined from 'lodash/isUndefined'
import classNames from 'classnames'
import shortcutManager from '../utils/shortcutManager'

export default class Search extends React.Component {
    constructor(props) {
        super(props)

        this.isInitialized = false
    }

    componentDidMount() {
        if (this.props.bindKey) {
            shortcutManager.bind('Search', {
                FOCUS_SEARCH: {
                    action: (e) => {
                        e.preventDefault()
                        const domNode = ReactDOM.findDOMNode(this.refs.searchInput)
                        domNode.focus()
                    }
                }
            })
        }

        if (this.props.forcedQuery) {
            this.refs.searchInput.value = this.props.forcedQuery || ''
        }
    }

    componentWillReceiveProps(nextProps) {
        const shouldSetValue = !this.isInitialized || (
                nextProps.location &&
                this.props.location !== nextProps.location
            )

        if (shouldSetValue) {
            this.refs.searchInput.value = ''

            if (!_isUndefined(nextProps.forcedQuery)) {
                this.refs.searchInput.value = nextProps.forcedQuery || ''
            }

            if (nextProps.forcedQuery) {
                // `this._debouncedSearch()` is not necessary in the ticket-list context, but I think it's better for
                // consistency that it gets executed anytime we force a query.
                this._debouncedSearch()
            }

            this.isInitialized = true
        }

        if (!this.props.shouldResetInput && nextProps.shouldResetInput) {
            this.refs.searchInput.value = ''
        }
    }

    componentWillUnmount() {
        if (this.props.bindKey) {
            shortcutManager.unbind('Search')
        }
    }

    // search every XXXms
    _debouncedSearch = _debounce(() => {
        if (!this.refs.searchInput) {
            return false
        }

        return this.props.onChange(this.refs.searchInput.value)
    }, this.props.searchDebounceTime || 200)

    render() {
        const {disabled} = this.props

        const containerClasses = classNames('ui search', this.props.className)
        const inputClasses = classNames('ui small icon fluid input', {
            disabled,
        })

        return (
            <div className={containerClasses}>
                <div className={inputClasses}>
                    <input
                        className="prompt"
                        type="text"
                        ref="searchInput"
                        placeholder={this.props.placeholder}
                        onChange={this._debouncedSearch}
                        autoFocus={this.props.autofocus}
                        disabled={disabled}
                    />
                    <i className="search icon" />
                </div>
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
    location: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

Search.defaultProps = {
    disabled: false,
    placeholder: 'Search',
}
