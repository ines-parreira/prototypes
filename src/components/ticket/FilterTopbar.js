import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import TopbarFilterGroup from './TopbarFilterGroup'
import { browserHistory } from 'react-router'


export default class FilterTopbar extends React.Component {
    renderSaveButtons = () => {
        const onClickUpdate = () => {
            this.props.submitView(this.props.view, this.props.urlSlug)
            browserHistory.push(`/app/tickets/${this.props.view.get('slug')}`)
        }
        const onClickNew = () => {
            const data = this.props.view.delete('id').delete('group_by').delete('icon')
            this.props.submitView(data, this.props.urlSlug)
            browserHistory.push(`/app/tickets/${this.props.view.get('slug')}`)
        }

        const onClick = () => this.props.submitView(this.props.view)

        return (
            <div className="right menu">
                <button className="ui basic green label item" onClick={onClickUpdate}>
                    UPDATE
                </button>
                <button className="ui green label item" onClick={onClickNew}>
                    SAVE AS NEW
                </button>
            </div>
        )
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

    render() {
        const style = { width: this.props.width }
        let component = null

        if (this.props.view.get('dirty')) {
            component = (
                <div className="FilterTopbar ui horizontal list segment" style={style}>
                    {this.props.groupedFilters.keySeq().toJS().map(this.renderFilter)}
                    {this.renderSaveButton()}
                </div>
            )
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
    clearFilter: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    urlSlug: PropTypes.string
}
