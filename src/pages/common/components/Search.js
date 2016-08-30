import React, {PropTypes} from 'react'
import _ from 'lodash'
import classNames from 'classnames'

export default class Search extends React.Component {
    constructor(props) {
        super(props)

        this.isInitialized = false

        // search every XXXms
        this.debouncedSearch = _.debounce(() => {
            for (const path of this.props.queryPath.split(',')) {
                _.set(this.props.query, path, this.refs.searchInput.value)
            }
            this.props.onChange(this.props.query, this.props.params, this.refs.searchInput.value)
        }, this.props.searchDebounceTime || 200)
    }

    componentWillReceiveProps(nextProps) {
        const shouldSetValue = !this.isInitialized
            || (
                this.props.location
                && nextProps.location
                && this.props.location !== nextProps.location
            )

        if (shouldSetValue) {
            this.refs.searchInput.value = ''

            if (nextProps.forcedQuery) {
                this.refs.searchInput.value = _.get(nextProps.forcedQuery.toJS(), nextProps.queryPath.split(',')[0])
            }

            this.isInitialized = true
        }
    }

    render() {
        const containerClasses = classNames('ui search', this.props.className)
        const inputClasses = classNames('ui small icon fluid input')

        return (
            <div className={containerClasses}>
                <div className={inputClasses}>
                    <input
                        className="prompt"
                        type="text"
                        ref="searchInput"
                        placeholder={this.props.placeholder || 'Search'}
                        onChange={this.debouncedSearch}
                        autoFocus={this.props.autofocus}
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
    forcedQuery: PropTypes.object,

    className: PropTypes.string,
    placeholder: PropTypes.string,
    autofocus: PropTypes.bool,
    searchDebounceTime: PropTypes.number,

    location: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}
