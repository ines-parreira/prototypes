import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import {Map, List} from 'immutable'

import {MAX_TICKET_COUNT_PER_VIEW} from '../../../../config/views'
import {getPluralObjectName} from '../../../../utils'
import Tooltip from '../Tooltip.js'
import shortcutManager from '../../../../services/shortcutManager/index'
import {moveIndex, MoveIndexDirection} from '../../utils/keyboard'
import {
    getActiveView,
    makeGetView,
    makeGetViewCount,
    makeGetViewsByType,
} from '../../../../state/views/selectors'
import {makeGetSettingsByType} from '../../../../state/currentUser/selectors'
import ViewName from '../ViewName/ViewName'
import ViewCount from '../ViewCount/index.js'
import history from '../../../history'
import {RootState} from '../../../../state/types'
import {ViewType} from '../../../../models/view/types'
import {UserSettingType} from '../../../../config/types/user'

import ViewNavbarViewEditor from './ViewNavbarViewEditor'
import css from './ViewNavbarView.less'

const popupEnterMessage = 'Create, re-order & hide views'
const popupLeaveMessage = 'Leave edit mode'

type OwnProps = {
    viewType: ViewType
    settingType: UserSettingType
    isLoading: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    hasEditMode: boolean
    viewCursor: number
}

// Component used to display a list of views in the navbar
class ViewNavbarView extends Component<Props, State> {
    static contextTypes = {
        closePanel: PropTypes.func.isRequired,
    }

    state = {
        hasEditMode: false,
        viewCursor: 0,
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('ViewNavbar')
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState({
            viewCursor: this._getViewCursor(
                nextProps.activeView,
                nextProps.views
            ),
        })
    }

    _bindKeys = () => {
        shortcutManager.bind('ViewNavbar', {
            GO_NEXT_VIEW: {
                action: () => this._moveCursor(),
            },
            GO_PREV_VIEW: {
                action: () => this._moveCursor(MoveIndexDirection.Prev),
            },
        })
    }

    _getDisplayedViews = (): List<any> => {
        // hide hidden views if we are not in edit mode
        if (!this.state.hasEditMode) {
            return this.props.views.filter(
                (view: Map<any, any>) => !view.get('hide', false)
            ) as List<any>
        }

        return this.props.views
    }

    _getViewCursor(activeView: Map<any, any>, views: List<any>) {
        return views.findIndex(
            (v: Map<any, any>) => v.get('id') === activeView.get('id')
        )
    }

    _updateViewUrl = _debounce((viewUrl: string) => {
        history.push(viewUrl)
    })

    _moveCursor = (direction: MoveIndexDirection = MoveIndexDirection.Next) => {
        const displayedViews = this._getDisplayedViews()
        const viewCursor = moveIndex(
            this.state.viewCursor,
            displayedViews.size,
            {
                direction,
                rotate: true,
            }
        )
        this.setState({viewCursor})

        const objectName = getPluralObjectName(this.props.viewType)
        const viewUrl = this._getViewUrl(
            objectName,
            displayedViews.get(viewCursor)
        )
        this._updateViewUrl(viewUrl)
    }

    _toggleHasEditMode = () => {
        const {hasEditMode} = this.state
        this.setState({hasEditMode: !hasEditMode})
    }

    _getViewUrl = (objectName: string, view: Map<any, any>) => {
        return `/app/${objectName}/${view.get('id') as number}/${
            view.get('slug') as string
        }`
    }

    render() {
        const {activeView, viewType, settings, isLoading} = this.props
        const {hasEditMode} = this.state
        // we use this to build urls
        const objectName: string = getPluralObjectName(viewType)

        const settingButtonClass = classnames(css.settingButton, {
            [css.active]: hasEditMode,
        })

        const displayedViews: List<any> = this._getDisplayedViews()

        return (
            <div>
                <div className="item">
                    <h4>
                        <i className="icon material-icons">view_list</i>
                        Views
                        {/*
                        TODO(customers-migration): remove this condition when we finished to migrate views
                        */}
                        {viewType !== 'customer-list' ? (
                            <span
                                onClick={this._toggleHasEditMode}
                                className={settingButtonClass}
                            >
                                <span id="navbar-views-settings">
                                    {isLoading ? (
                                        <i className="material-icons md-spin">
                                            refresh
                                        </i>
                                    ) : (
                                        <i className="d-none d-md-inline-block material-icons">
                                            {hasEditMode ? 'close' : 'settings'}
                                        </i>
                                    )}
                                </span>
                                <Tooltip
                                    placement="top"
                                    target="navbar-views-settings"
                                >
                                    {hasEditMode
                                        ? popupLeaveMessage
                                        : popupEnterMessage}
                                </Tooltip>
                            </span>
                        ) : null}
                    </h4>
                    <div className="menu">
                        {hasEditMode ? (
                            <ViewNavbarViewEditor
                                setting={settings}
                                views={displayedViews}
                                objectName={objectName}
                            />
                        ) : (
                            displayedViews.map((view: Map<any, any>) => {
                                const isCurrentView =
                                    activeView.get('id') === view.get('id')
                                const isFocused = window.location.pathname.startsWith(
                                    `/app/tickets/${view.get('id') as number}/`
                                )

                                const key = `${view.get('slug') as string}-${
                                    view.get('id') as number
                                }`
                                const classes = classnames('item', {
                                    active: isCurrentView,
                                    focused: isFocused,
                                })

                                const viewCount = this.props.getViewCount(
                                    view.get('id')
                                )
                                let count = ''
                                let isMoreThanMaxCount = false

                                if (viewCount !== null) {
                                    isMoreThanMaxCount =
                                        viewCount >= MAX_TICKET_COUNT_PER_VIEW
                                    count = `(${
                                        isMoreThanMaxCount
                                            ? `${
                                                  MAX_TICKET_COUNT_PER_VIEW - 1
                                              }+`
                                            : viewCount
                                    })`
                                }

                                return (
                                    <Link
                                        key={key}
                                        to={this._getViewUrl(objectName, view)}
                                        className={classes}
                                        title={`${
                                            view.get('name') as string
                                        } ${count}`}
                                        onClick={() => {
                                            ;(this.context as {
                                                closePanel: () => void
                                            }).closePanel()
                                        }}
                                    >
                                        <span className="item-name">
                                            <ViewName view={view} />
                                        </span>
                                        <span className="item-count">
                                            <ViewCount view={view} />
                                        </span>
                                    </Link>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

const connector = connect((state: RootState, props: OwnProps) => {
    const getSettingsByType = makeGetSettingsByType()
    const getViewsByType = makeGetViewsByType()
    return {
        getView: makeGetView(state),
        getViewCount: makeGetViewCount(state),
        activeView: getActiveView(state),
        views: getViewsByType(state, props.viewType),
        settings: getSettingsByType(state, props.settingType),
    }
})

export default connector(ViewNavbarView)
