import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import classNames from 'classnames'
import {
    Button,
    Popover,
    PopoverTitle,
    PopoverContent,
    Card,
    CardFooter,
    CardBlock,
} from 'reactstrap'

import Filters from './Filters'
import {slugify} from '../../../../utils'
import {logEvent} from '../../../../store/middlewares/amplitudeTracker'

import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'
import * as usersSelectors from '../../../../state/users/selectors'

class FilterTopbar extends React.Component {
    static propTypes = {
        activeView: ImmutablePropTypes.map.isRequired,
        agents: PropTypes.object.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        currentUser: PropTypes.object.isRequired,
        fetchPage: PropTypes.func.isRequired,
        isUpdate: PropTypes.bool.isRequired,
        pristineActiveView: ImmutablePropTypes.map.isRequired,
        removeFieldFilter: PropTypes.func.isRequired,
        updateFieldFilter: PropTypes.func.isRequired,
        updateFieldFilterOperator: PropTypes.func.isRequired,
        resetView: PropTypes.func.isRequired,
        submitView: PropTypes.func.isRequired,
    }

    state = {
        isSubmitting: false,
        askUpdateConfirmation: false,
    }

    _onClickUpdate = () => {
        this.setState({
            isSubmitting: true,
            askUpdateConfirmation: false,
        })
        this._submitView(this.props.activeView)
        logEvent('Updated view')
    }

    _onClickNew = () => {
        this.setState({
            isSubmitting: true
        })

        let activeView = this.props.activeView
        const original = this.props.pristineActiveView

        // new means it has no id set
        activeView = activeView.delete('id')

        // if the name wasn't changed, add (copy) to it
        if (original.get('name') === activeView.get('name')) {
            const newName = `${activeView.get('name', '')} - copy`
            const newSlug = slugify(newName)

            activeView = activeView
                .set('name', newName)
                .set('slug', newSlug)
        }

        this._submitView(activeView)
        logEvent('Saved as new view')
    }

    _cancel = () => {
        const {config, isUpdate, fetchPage, resetView} = this.props
        if (isUpdate) {
            // if is updating an existing view, on cancel we reset current view
            resetView()
            fetchPage(1)
        } else {
            // if is updating an existing view, on cancel we leave edition
            browserHistory.push(`/app/${config.get('routeList')}/`)
        }
    }

    _createView = () => {
        this.setState({
            isSubmitting: true
        })

        let activeView = this.props.activeView
        // new means it has no id set
        activeView = activeView
            .delete('id')
            .set('name', activeView.get('name') || 'New view')
        activeView = activeView.set('slug', slugify(activeView.get('name')))

        this._submitView(activeView)
        logEvent('Created a new view')
    }

    _submitView = (view) => {
        this.props.submitView(view).then(() => {
            this.setState({
                isSubmitting: false
            })
        })
    }

    _toggleUpdateConfirmation = () => {
        this.setState({
            askUpdateConfirmation: !this.state.askUpdateConfirmation,
        })
    }

    render() {
        const {activeView, isUpdate, agents, currentUser} = this.props
        const {isSubmitting} = this.state

        if (!activeView.get('editMode')) {
            return null
        }

        return (
            <Card className="mt-2">
                <CardBlock className="filter-topbar-content">
                    <Filters
                        view={activeView}
                        removeFieldFilter={(...args) => {
                            this.props.removeFieldFilter(...args)
                            this.props.fetchPage(1)
                        }}
                        updateFieldFilterOperator={(...args) => {
                            this.props.updateFieldFilterOperator(...args)
                            this.props.fetchPage(1)
                        }}
                        agents={agents}
                        currentUser={currentUser}
                        updateFieldFilter={(...args) => {
                            this.props.updateFieldFilter(...args)
                            this.props.fetchPage(1)
                        }}
                    />

                    <span className="text-muted">
                        <i className="fa fa-fw fa-info-circle mr-2" />
                        Click on a column's name to add a filter.
                    </span>
                </CardBlock>
                <CardFooter>
                    {
                        isUpdate ? (
                                <span>
                                    <Button
                                        id="update-view-button"
                                        color="primary"
                                        className={classNames('mr-2', {
                                            'btn-loading': this.state.isSubmitting,
                                        })}
                                        disabled={isSubmitting}
                                        onClick={this._toggleUpdateConfirmation}
                                    >
                                        Update view
                                    </Button>{' '}
                                    <Popover
                                        placement="bottom"
                                        isOpen={this.state.askUpdateConfirmation}
                                        target="update-view-button"
                                        toggle={this._toggleUpdateConfirmation}
                                    >
                                        <PopoverTitle>Are you sure?</PopoverTitle>
                                        <PopoverContent>
                                            <p>
                                                You are about to edit this view for <b>all users</b>.
                                            </p>
                                            <Button
                                                color="success"
                                                onClick={this._onClickUpdate}
                                            >
                                                Confirm
                                            </Button>
                                        </PopoverContent>
                                    </Popover>
                                    <Button
                                        color="secondary"
                                        className={classNames({
                                            'btn-loading': this.state.isSubmitting,
                                        })}
                                        disabled={isSubmitting}
                                        onClick={this._onClickNew}
                                    >
                                        Save as new view
                                    </Button>
                                </span>
                            ) : (
                                <Button
                                    color="primary"
                                    className={classNames({
                                        'btn-loading': this.state.isSubmitting,
                                    })}
                                    disabled={isSubmitting}
                                    onClick={this._createView}
                                >
                                    Create view
                                </Button>
                            )
                    }

                    <Button
                        color="secondary"
                        className="pull-right"
                        disabled={isSubmitting}
                        onClick={this._cancel}
                    >
                        Cancel
                    </Button>
                </CardFooter>
            </Card>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        agents: usersSelectors.getAgents(state),
        activeView: viewsSelectors.getActiveView(state),
        config: viewsSelectors.getViewConfig(ownProps.type),
        currentUser: state.currentUser,
        isEditMode: viewsSelectors.isEditMode(state),
        pristineActiveView: viewsSelectors.getPristineActiveView(state),
        selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
    }
}

const mapDispatchToProps = {
    fetchPage: viewsActions.fetchPage,
    toggleSelection: viewsActions.toggleSelection,
    updateView: viewsActions.updateView,
    removeFieldFilter: viewsActions.removeFieldFilter,
    resetView: viewsActions.resetView,
    submitView: viewsActions.submitView,
    updateFieldFilter: viewsActions.updateFieldFilter,
    updateFieldFilterOperator: viewsActions.updateFieldFilterOperator,
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterTopbar)
