import React, {PropTypes} from 'react'
import {throttle} from 'lodash'
import classNames from 'classnames'

export default class Search extends React.Component {

    constructor(props) {
        super(props)

        // search every 300ms
        this.throttledSearch = throttle(() => {
            this.props.search(this.props, this.refs.searchInput.value)
        }, this.props.searchDebounceTime || 200)
    }

    render() {
        const {id} = this.props
        const containerClass = classNames('ui', this.props.searchSize || 'small', 'icon input')

        return (
            <div className="ui search">
                <div className={containerClass}>
                    <input
                        id={id}
                        className="prompt"
                        type="text"
                        ref="searchInput"
                        placeholder={this.props.placeholder || 'Search'}
                        onChange={this.throttledSearch}
                        autoFocus={this.props.autofocus}
                    />
                    <i className="search icon"/>
                </div>
                <div className="results"></div>
            </div>
        )
    }
}

Search.propTypes = {
    id: PropTypes.string.isRequired,
    search: PropTypes.func.isRequired,
    fields: React.PropTypes.arrayOf(React.PropTypes.string),
    autofocus: PropTypes.bool,
    placeholder: PropTypes.string,
    searchDebounceTime: React.PropTypes.number,
    searchSize: React.PropTypes.string
}
