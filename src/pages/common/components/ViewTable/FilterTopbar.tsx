import React from 'react'
import {Map, List} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Popover,
    PopoverBody,
    PopoverHeader,
    UncontrolledButtonDropdown,
    UncontrolledDropdown,
} from 'reactstrap'

import ConfirmButton from '../ConfirmButton'
import {ViewVisibility, View} from '../../../../models/view/types'
import {fieldPath, getDefaultOperator, slugify} from '../../../../utils'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker.js'
import ViewSharingButton from '../ViewSharing/ViewSharingButton'
import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'
import * as agentSelectors from '../../../../state/agents/selectors'
import * as teamSelectors from '../../../../state/teams/selectors'
import * as schemasSelectors from '../../../../state/schemas/selectors'
import * as viewsConfig from '../../../../config/views'
import {SYSTEM_VIEW_CATEGORY} from '../../../../constants/view'
import {RootState} from '../../../../state/types'
import {
    viewCreated,
    viewDeleted,
    viewUpdated,
} from '../../../../state/entities/views/actions'
import {activeViewIdSet} from '../../../../state/ui/views/actions'
import history from '../../../history'
import {
    SUBMIT_NEW_VIEW_ERROR,
    SUBMIT_UPDATE_VIEW_ERROR,
} from '../../../../state/views/constants.js'

import Filters from './Filters/ViewFilters'
import css from './FilterTopbar.less'

type OwnProps = {
    isUpdate: boolean
    isSearch: boolean
    type: string
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    isSubmitting: boolean
    askUpdateConfirmation: boolean
}

export class FilterTopbarContainer extends React.Component<Props, State> {
    state = {
        isSubmitting: false,
        askUpdateConfirmation: false,
    }

    componentDidUpdate(prevProps: Props) {
        const {activeView, areFiltersValid, fetchViewItems} = this.props
        const {askUpdateConfirmation} = this.state

        // fetch page again when filters changed and that filters are valid
        const isSameView =
            prevProps.activeView.get('id') === activeView.get('id')
        const filtersHaveChanged =
            prevProps.activeView.get('filters') !== activeView.get('filters')

        if (isSameView && filtersHaveChanged && areFiltersValid) {
            void fetchViewItems()
        }
        if (
            prevProps.activeView.get('editMode') !==
                activeView.get('editMode') &&
            askUpdateConfirmation
        ) {
            this.setState({askUpdateConfirmation: false})
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
    }

    _onClickNew = () => {
        const {currentUser} = this.props
        if (!this.props.areFiltersValid) {
            return
        }

        this.setState({
            isSubmitting: true,
        })

        let activeView = this.props.activeView
        const original = this.props.pristineActiveView

        // new means it has no id set
        activeView = activeView.delete('id')

        // if the name wasn't changed, add (copy) to it
        if (original.get('name') === activeView.get('name')) {
            const newName = `${activeView.get('name', '') as string} - copy`
            const newSlug = slugify(newName)

            activeView = activeView.set('name', newName).set('slug', newSlug)
        }
        if (activeView.get('visibility') === ViewVisibility.Private) {
            activeView = activeView.set('shared_with_users', [
                currentUser.get('id'),
            ])
        }

        this._submitView(activeView)
    }

    _left = (field: Map<any, any>) => {
        const viewConfig = this.props.config
        return `${viewConfig.get('singular') as string}.${fieldPath(field)}`
    }

    _onClickFilter = (field: Map<any, any>) => {
        const left = this._left(field)
        const operator = getDefaultOperator(left, this.props.schemas) as string
        const filter = {
            left,
            operator,
        }
        this.props.addFieldFilter(field.toJS(), filter)
    }

    _cancel = () => {
        const {config, isUpdate, fetchViewItems, resetView} = this.props

        this.setState({askUpdateConfirmation: false})
        if (isUpdate) {
            // if is updating an existing view, on cancel we reset current view
            resetView()
            void fetchViewItems()
        } else {
            // if is updating an existing view, on cancel we leave edition
            history.push(`/app/${config.get('routeList') as string}/`)
        }
    }

    _createView = () => {
        const {currentUser} = this.props
        if (!this.props.areFiltersValid) {
            return
        }

        this.setState({
            isSubmitting: true,
        })

        let activeView = this.props.activeView
        // new means it has no id set
        activeView = activeView
            .delete('id')
            .set('name', activeView.get('name') || 'New view')
        activeView = activeView.set('slug', slugify(activeView.get('name')))
        if (activeView.get('visibility') === ViewVisibility.Private) {
            activeView = activeView.set('shared_with_users', [
                currentUser.get('id'),
            ])
        }

        this._submitView(activeView)
    }

    _submitView = (view: Map<any, any>) => {
        const {
            viewCreated,
            viewUpdated,
            activeViewIdSet,
            submitView,
        } = this.props

        void submitView(view).then((resp) => {
            this.setState({
                isSubmitting: false,
            })
            if (
                [SUBMIT_UPDATE_VIEW_ERROR, SUBMIT_NEW_VIEW_ERROR].includes(
                    (resp as {type: string}).type
                )
            ) {
                return
            }
            if (view.get('id') == null) {
                window.Raven?.captureBreadcrumb({
                    message: 'View created from client',
                    data: resp,
                    level: 'log',
                })
                viewCreated(resp as View)
            } else {
                viewUpdated(resp as View)
            }
            activeViewIdSet((resp as View).id)
        })
    }

    _toggleUpdateConfirmation = () => {
        this.setState({
            askUpdateConfirmation: !this.state.askUpdateConfirmation,
        })
    }

    render() {
        const {
            config,
            activeView,
            activeViewIdSet,
            areFiltersValid,
            isDirty,
            isUpdate,
            isSearch,
            agents,
            teams,
            viewDeleted,
        } = this.props
        const {isSubmitting} = this.state
        const isSystemView = activeView.get('category') === SYSTEM_VIEW_CATEGORY

        if (!activeView.get('editMode') && !isSearch) {
            return null
        }

        const filterableFields = (config.get('fields') as List<any>)
            .filter(
                (field: Map<any, any>) =>
                    !!field.get('filter') &&
                    (field.getIn(['filter', 'show'], true) as boolean)
            )
            .sortBy((field: Map<any, any>) => field.get('title') as string)

        return (
            <Card className={css.component}>
                <CardBody className="filter-topbar-content">
                    {isUpdate && !isSearch && (
                        <ViewSharingButton
                            view={activeView}
                            className="float-right"
                        />
                    )}
                    <p className={css.subtitle}>ADVANCED FILTERS</p>
                    <Filters
                        view={activeView}
                        removeFieldFilter={this.props.removeFieldFilter}
                        updateFieldFilter={this.props.updateFieldFilter}
                        updateFieldFilterOperator={
                            this.props.updateFieldFilterOperator
                        }
                        agents={agents}
                        teams={teams}
                    />

                    <UncontrolledDropdown>
                        <DropdownToggle
                            caret
                            type="button"
                            color="secondary"
                            size="sm"
                            className="mr-2"
                            onClick={() => {
                                segmentTracker.logEvent(
                                    segmentTracker.EVENTS
                                        .VIEW_FILTER_ADD_CLICKED
                                )
                            }}
                        >
                            <i className="material-icons mr-2">add</i>
                            Add filter
                        </DropdownToggle>
                        <DropdownMenu>
                            {filterableFields.map((field: Map<any, any>) => {
                                return (
                                    <DropdownItem
                                        key={field.get('name')}
                                        type="button"
                                        onClick={() =>
                                            this._onClickFilter(field)
                                        }
                                    >
                                        {field.get('title')}
                                    </DropdownItem>
                                )
                            })}
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </CardBody>
                {!isSearch && (
                    <CardFooter>
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                {isSystemView ? (
                                    <span>
                                        <i className="material-icons mr-2">
                                            info
                                        </i>
                                        This view cannot be saved
                                    </span>
                                ) : isUpdate ? (
                                    <UncontrolledButtonDropdown>
                                        <Button
                                            type="submit"
                                            id="update-view-button"
                                            color="success"
                                            className={classnames({
                                                'btn-loading': this.state
                                                    .isSubmitting,
                                            })}
                                            disabled={
                                                isSubmitting ||
                                                !areFiltersValid ||
                                                !isDirty
                                            }
                                            onClick={
                                                this._toggleUpdateConfirmation
                                            }
                                        >
                                            Update view
                                        </Button>
                                        <Popover
                                            placement="bottom"
                                            isOpen={
                                                this.state.askUpdateConfirmation
                                            }
                                            target="update-view-button"
                                            toggle={
                                                this._toggleUpdateConfirmation
                                            }
                                            trigger="legacy"
                                        >
                                            <PopoverHeader>
                                                Are you sure?
                                            </PopoverHeader>
                                            <PopoverBody>
                                                <p>
                                                    You are about to edit this
                                                    view for <b>all users</b>.
                                                </p>
                                                <Button
                                                    type="submit"
                                                    color="success"
                                                    onClick={
                                                        this._onClickUpdate
                                                    }
                                                >
                                                    Confirm
                                                </Button>
                                            </PopoverBody>
                                        </Popover>
                                        <DropdownToggle
                                            caret
                                            type="button"
                                            color="success"
                                        />
                                        <DropdownMenu right>
                                            <DropdownItem
                                                key="open"
                                                type="button"
                                                disabled={
                                                    isSubmitting ||
                                                    !areFiltersValid
                                                }
                                                onClick={this._onClickNew}
                                            >
                                                Save as new view
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledButtonDropdown>
                                ) : (
                                    <Button
                                        type="submit"
                                        color="primary"
                                        className={classnames({
                                            'btn-loading': this.state
                                                .isSubmitting,
                                        })}
                                        disabled={
                                            isSubmitting || !areFiltersValid
                                        }
                                        onClick={this._createView}
                                    >
                                        Create view
                                    </Button>
                                )}
                                {!isSearch && (
                                    <Button
                                        type="submit"
                                        color="secondary"
                                        className="ml-2"
                                        disabled={isSubmitting}
                                        onClick={this._cancel}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                            {!isSearch && !isSystemView && isUpdate && (
                                <ConfirmButton
                                    id="delete-view"
                                    content={
                                        <span>
                                            You are about to <b>delete</b> this
                                            view for <b>all users</b>.
                                        </span>
                                    }
                                    confirm={() => {
                                        return this.props
                                            .deleteView(activeView)
                                            .then((destinationView) => {
                                                viewDeleted(
                                                    activeView.get('id')
                                                )
                                                activeViewIdSet(
                                                    (destinationView as Map<
                                                        any,
                                                        any
                                                    >).get('id')
                                                )
                                            })
                                    }}
                                >
                                    <i className="material-icons md-2 mr-2 text-danger">
                                        delete
                                    </i>
                                    Delete view
                                </ConfirmButton>
                            )}
                        </div>
                    </CardFooter>
                )}
            </Card>
        )
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
    return {
        agents: agentSelectors.getAgents(state),
        teams: teamSelectors.getTeams(state),
        activeView: viewsSelectors.getActiveView(state),
        areFiltersValid: viewsSelectors.areFiltersValid(state),
        config: viewsConfig.getConfigByName(ownProps.type),
        currentUser: state.currentUser,
        isDirty: viewsSelectors.isDirty(state),
        pristineActiveView: viewsSelectors.getPristineActiveView(state),
        schemas: schemasSelectors.getSchemas(state),
    }
}

const mapDispatchToProps = {
    fetchViewItems: viewsActions.fetchViewItems,
    resetView: viewsActions.resetView,
    submitView: viewsActions.submitView,
    deleteView: viewsActions.deleteView,
    addFieldFilter: viewsActions.addFieldFilter,
    removeFieldFilter: viewsActions.removeFieldFilter,
    updateFieldFilter: viewsActions.updateFieldFilter,
    updateFieldFilterOperator: viewsActions.updateFieldFilterOperator,
    viewCreated,
    viewDeleted,
    viewUpdated,
    activeViewIdSet,
}

const connector = connect(mapStateToProps, mapDispatchToProps)

export default connector(FilterTopbarContainer)
