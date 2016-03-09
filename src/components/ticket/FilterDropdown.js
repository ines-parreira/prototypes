import React, {PropTypes} from 'react'
import {_} from 'lodash'
import classNames from 'classNames'


export default class FilterDropdown extends React.Component {
    constructor(){
        super()
        this.initJQuery = _.once(this._initJQuery)
        this.state = {intialized: false}
    }

    onChange = (...args) => {
        // Semantic UI fires onChange with set selected, so only fire after that has happened
        return this.state.intialized ? this.props.onChange(...args) : null
    }

    componentDidUpdate = () => {
        // Check that we received the values and intialize the Semantic component
        const dataLoaded = !_.isEmpty(this.props.wrappedValue)
        if (dataLoaded) {
            this.initJQuery()
        }
    }

    _initJQuery = () => {
        const defaults = {
            onChange: this.onChange
        }
        $(this.refs.uicomponent)
            .dropdown(_.defaults(defaults, this.props.options))
            .dropdown('set selected', this.props.selected)
        this.setState({intialized: true})
    }

    renderWrapped = (value) => {
        if (_.isObject(value)) {
            return this.renderValue(value.id, value.name)
        } else {
            // Treat as string
            const name = value.charAt(0).toUpperCase() + value.substr(1)
            return this.renderValue(value, name)
        }
    }

    renderValue = (value, name) => {
        return (
            <div key={value} className="item" data-value={value}>
                <div className="ui teal empty circular label"></div>
                {name}
            </div>
        )
    }

    render() {
        const className = classNames("ui", "dropdown", {multiple: this.props.multiple })

        return (
            <div className="FilterDropdown">
                <div ref="uicomponent" className={className}>
                    <input type="hidden" name="filters" />
                    <i className="filter icon"></i>
                    <span className="text">{this.props.header}</span>
                    <div className="menu">
                        <div className="ui icon search input">
                            <i className="search icon"></i>
                            <input type="text" placeholder={this.props.placeholder} />
                        </div>
                        <div className="divider"></div>
                        <div className="header">
                            <i className="icon"></i>
                            {this.props.header}
                        </div>
                        <div className="scrolling menu">
                            {this.props.wrappedValue.map(this.renderWrapped)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

FilterDropdown.propTypes = {
    wrappedValue: PropTypes.array.isRequired,
    header: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
}
