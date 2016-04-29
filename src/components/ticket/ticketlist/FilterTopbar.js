import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import TopbarFilterGroup from './TopbarFilterGroup'
import { browserHistory } from 'react-router'


export default class FilterTopbar extends React.Component {
    onClickUpdate = () => {
        this.props.submitView(this.props.view, this.props.slug)
        browserHistory.push(`/app/tickets/${this.props.view.get('slug')}`)
    }
    onClickNew = () => {
        const data = this.props.view.delete('id').delete('group_by').delete('icon')
        this.props.submitView(data, this.props.slug)
        browserHistory.push(`/app/tickets/${this.props.view.get('slug')}`)
    }

    renderFilter = (name) => {
        const { callee } = this.props.filterSpecs[name]

        return (
            <TopbarFilterGroup
                key={name}
                view={this.props.view}
                filterSpec={this.props.filterSpecs[name]}
                values={this.props.groupedFilters.get(name)[callee]}
                updateFilters={this.props.updateFilters}
                clearFilter={this.props.clearFilter}
                submitView={this.props.submitView}
            />
        )
    }

    renderComponent() {
        if (this.props.view.get('dirty')) {
            return (
                <div className="FilterTopbar ui menu segment" style={{ width: this.props.width }}>
                    {this.props.groupedFilters.keySeq().toJS().map(this.renderFilter)}
                    <div className="right menu">
                        <button className="ui basic green label item" onClick={this.onClickUpdate}>
                            UPDATE
                        </button>
                        <button className="ui green label item" onClick={this.onClickNew}>
                            SAVE AS NEW
                        </button>
                    </div>
                </div>
            )
        }
    }

    render() {
        const component = this.renderComponent()

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
    clearFilter: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    slug: PropTypes.string
}
