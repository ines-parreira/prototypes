import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'
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
    }

    componentWillReceiveProps(nextProps) {
        const shouldSetValue = !this.isInitialized || (
                nextProps.location &&
                this.props.location !== nextProps.location
            )

        if (shouldSetValue) {
            this.refs.searchInput.value = ''

            if (nextProps.forcedQuery) {
                if (typeof nextProps.forcedQuery === 'object') {
                    this.refs.searchInput.value = _.get(nextProps.forcedQuery.toJS(), nextProps.queryPath.split(',')[0])
                } else if (typeof nextProps.forcedQuery === 'string') {
                    this.refs.searchInput.value = nextProps.forcedQuery
                }

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
    _debouncedSearch = _.debounce(() => {
        if (!this.refs.searchInput) {
            return false
        }

        const paths = this.props.queryPath.split(',')
        const query = this.props.query
        const value = this.refs.searchInput.value

        paths.forEach((path) => {
            _.set(query, path, value)
        })

        this.props.onChange(query, value, this.props.params)
    }, this.props.searchDebounceTime || 200)

    render() {
        const containerClasses = classNames('ui search', this.props.className)
        const inputClasses = classNames('ui small icon fluid input', {
            disabled: this.props.disabled
        })

        return (
            <div className={containerClasses}>
                <div className={inputClasses}>
                    <input
                        className="prompt"
                        type="text"
                        ref="searchInput"
                        placeholder={this.props.placeholder || 'Search'}
                        onChange={this._debouncedSearch}
                        autoFocus={this.props.autofocus}
                        disabled={this.props.disabled}
                    />
                    <i className="search icon" />
                </div>
            </div>
        )
    }
}

Search.propTypes = {
    onChange: PropTypes.func.isRequired,
    query: PropTypes.object.isRequired,
    queryPath: PropTypes.string.isRequired,
    params: PropTypes.object,
    forcedQuery: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    shouldResetInput: PropTypes.bool,
    disabled: PropTypes.bool,

    className: PropTypes.string,
    placeholder: PropTypes.string,
    autofocus: PropTypes.bool,
    bindKey: PropTypes.bool,
    searchDebounceTime: PropTypes.number,

    location: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

Search.defaultProps = {
    disabled: false
}
