import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import _ from 'lodash'
import TopbarFilterGroup from './TopbarFilterGroup'


export default class FilterTopbar extends React.Component {
    renderSaveButton = () => {
        return null // todo: remove that
        if (!this.props.view.get('dirty')) {
            return null
        }

        const onClick = () => this.props.submitView(this.props.view)

        return (
            <div className="item" key="save">
                <button id="save" className="ui green label" onClick={onClick}>
                    Save
                </button>
            </div>
        )
    }

    renderFilter = (name) => {
        return (
            <TopbarFilterGroup
                key={name}
                view={this.props.view}
                filterSpec={this.props.filterSpecs[name]}
                groupedFilters={this.props.groupedFilters}
                updateFilters={this.props.updateFilters}
                clearFilter={this.props.clearFilter}
                submitView={this.props.submitView}
            />
        )
    }

    render() {
        let component = (
                <div className="FilterTopbar ui horizontal list segment full-width">
                    {this.props.groupedFilters.keySeq().map(this.renderFilter)}
                    {this.renderSaveButton()}
                </div>
            )

        if (!this.props.view.get('dirty')) {
            component = null
        }
        return (
            <ReactCSSTransitionGroup
                transitionName="viewFilterTopbar"
                transitionEnterTimeout={250}
                transitionLeaveTimeout={200}
            >
                {component}
            </ReactCSSTransitionGroup>
        )
    }
}

FilterTopbar.propTypes = {
    view: PropTypes.object.isRequired,
    filterSpecs: PropTypes.object.isRequired,
    groupedFilters: PropTypes.object.isRequired,
    submitView: PropTypes.func.isRequired,
    updateFilters: PropTypes.func.isRequired,
    clearFilter: PropTypes.func.isRequired
}
