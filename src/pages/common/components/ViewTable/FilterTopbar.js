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
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Card,
    CardFooter,
    CardBlock,
} from 'reactstrap'

import Filters from './Filters'
import {equalityOperator, slugify, fieldPath} from '../../../../utils'
import {logEvent} from '../../../../store/middlewares/amplitudeTracker'

import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'
import * as usersSelectors from '../../../../state/users/selectors'
import * as schemasSelectors from '../../../../state/schemas/selectors'

import * as viewsConfig from '../../../../config/views'

class FilterTopbar extends React.Component {
    static propTypes = {
        activeView: ImmutablePropTypes.map.isRequired,
        addFieldFilter: PropTypes.func.isRequired,
        agents: PropTypes.object.isRequired,
        areFiltersValid: PropTypes.bool.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        currentUser: PropTypes.object.isRequired,
        fetchPage: PropTypes.func.isRequired,
        isUpdate: PropTypes.bool.isRequired,
        pristineActiveView: ImmutablePropTypes.map.isRequired,
        removeFieldFilter: PropTypes.func.isRequired,
        updateFieldFilter: PropTypes.func.isRequired,
        updateFieldFilterOperator: PropTypes.func.isRequired,
        resetView: PropTypes.func.isRequired,
        schemas: PropTypes.object.isRequired,
        submitView: PropTypes.func.isRequired,
    }

    state = {
        isSubmitting: false,
        askUpdateConfirmation: false,
    }

    componentWillReceiveProps(nextProps) {
        // fetch page again when filters changed and that filters are valid
        const isSameView = this.props.activeView.get('id') === nextProps.activeView.get('id')
        const filtersHaveChanged = this.props.activeView.get('filters') !== nextProps.activeView.get('filters')

        if (isSameView && filtersHaveChanged && nextProps.areFiltersValid) {
            this.props.fetchPage(1)
        }
    }

    _onClickUpdate = () => {
        if (!this.props.areFiltersValid) {
            return
        }

        this.setState({
            isSubmitting: true,
            askUpdateConfirmation: false,
        })

        this._submitView(this.props.activeView)
        logEvent('Updated view')
    }

    _onClickNew = () => {
        if (!this.props.areFiltersValid) {
            return
        }

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

    _left = (field) => {
        const viewConfig = this.props.config
        return `${viewConfig.get('singular')}.${fieldPath(field)}`
    }

    _onClickFilter = (field) => {
        const left = this._left(field)

        this.props.addFieldFilter(field.toJS(), {
            left,
            operator: equalityOperator(left, this.props.schemas),
            right: '\'\'',
        })
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
        if (!this.props.areFiltersValid) {
            return
        }

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
        const {config, activeView, areFiltersValid, isUpdate, agents, currentUser} = this.props
        const {isSubmitting} = this.state
        const isSystemView = activeView.get('category') === 'system'

        if (!activeView.get('editMode')) {
            return null
        }

        const filterableFields = config.get('fields')
            .filter(field => field.get('filter') && !field.getIn(['filter', 'sort']))
            .sortBy(field => field.get('title'))

        return (
            <Card className="mt-2">
                <CardBlock className="filter-topbar-content">
                    <Filters
                        view={activeView}
                        removeFieldFilter={this.props.removeFieldFilter}
                        updateFieldFilterOperator={this.props.updateFieldFilterOperator}
                        agents={agents}
                        currentUser={currentUser}
                        updateFieldFilter={this.props.updateFieldFilter}
                    />

                    <UncontrolledDropdown>
                        <DropdownToggle
                            caret
                            type="button"
                            className="mr-2"
                            onClick={() => logEvent('Click add filter on a view')}
                        >
                            <i className="fa fa-plus fa-fw mr-2"/>
                            Add filter
                        </DropdownToggle>
                        <DropdownMenu>
                            {
                                filterableFields.map((field) => {
                                    return (
                                        <DropdownItem
                                            key={field.get('name')}
                                            type="button"
                                            onClick={() => this._onClickFilter(field)}
                                        >
                                            {field.get('title')}
                                        </DropdownItem>
                                    )
                                })
                            }
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </CardBlock>
                <CardFooter>
                    <div className="d-flex align-items-center justify-content-between">
                        {
                            isSystemView ? (
                                <span>
                                    <i className="fa fa-fw fa-info-circle mr-2"/>
                                    System views changes cannot be saved
                                </span>
                            ) : (
                                isUpdate ? (
                                    <span>
                                    <Button
                                        type="submit"
                                        id="update-view-button"
                                        color="primary"
                                        className={classNames('mr-2', {
                                            'btn-loading': this.state.isSubmitting,
                                        })}
                                        disabled={isSubmitting || !areFiltersValid}
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
                                                type="submit"
                                                color="success"
                                                onClick={this._onClickUpdate}
                                            >
                                                Confirm
                                            </Button>
                                        </PopoverContent>
                                    </Popover>
                                    <Button
                                        type="submit"
                                        color="secondary"
                                        className={classNames({
                                            'btn-loading': this.state.isSubmitting,
                                        })}
                                        disabled={isSubmitting || !areFiltersValid}
                                        onClick={this._onClickNew}
                                    >
                                        Save as new view
                                    </Button>
                                </span>
                                ) : (
                                    <Button
                                        type="submit"
                                        color="primary"
                                        className={classNames({
                                            'btn-loading': this.state.isSubmitting,
                                        })}
                                        disabled={isSubmitting || !areFiltersValid}
                                        onClick={this._createView}
                                    >
                                        Create view
                                    </Button>
                                )
                            )
                        }

                        <Button
                            type="submit"
                            color="secondary"
                            className="pull-right"
                            disabled={isSubmitting}
                            onClick={this._cancel}
                        >
                            Cancel
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        agents: usersSelectors.getAgents(state),
        activeView: viewsSelectors.getActiveView(state),
        areFiltersValid: viewsSelectors.areFiltersValid(state),
        config: viewsConfig.getConfigByName(ownProps.type),
        currentUser: state.currentUser,
        isEditMode: viewsSelectors.isEditMode(state),
        pristineActiveView: viewsSelectors.getPristineActiveView(state),
        schemas: schemasSelectors.getSchemas(state),
        selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
    }
}

const mapDispatchToProps = {
    addFieldFilter: viewsActions.addFieldFilter,
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
