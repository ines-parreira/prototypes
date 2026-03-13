import React, { Component } from 'react'

import { history } from '@repo/routing'
import { shortcutManager } from '@repo/utils'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import _debounce from 'lodash/debounce'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import navbarCss from 'assets/css/navbar.less'
import type { UserSettingType } from 'config/types/user'
import { MAX_TICKET_COUNT_PER_VIEW } from 'config/views'
import { ViewType } from 'models/view/types'
import ViewCount from 'pages/common/components/ViewCount/ViewCount'
import ViewName from 'pages/common/components/ViewName/ViewName'
import css from 'pages/common/components/ViewNavbarView/ViewNavbarView.less'
import ViewNavbarViewEditor from 'pages/common/components/ViewNavbarView/ViewNavbarViewEditor'
import { moveIndex, MoveIndexDirection } from 'pages/common/utils/keyboard'
import { makeGetSettingsByType } from 'state/currentUser/selectors'
import { closePanels } from 'state/layout/actions'
import type { RootState } from 'state/types'
import {
    getActiveView,
    makeGetView,
    makeGetViewCount,
    makeGetViewsByType,
} from 'state/views/selectors'
import { getPluralObjectName } from 'utils'

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

    componentDidUpdate(prevProps: Props) {
        if (
            prevProps.activeView !== this.props.activeView ||
            prevProps.views !== this.props.views
        ) {
            const viewCursor = this._getViewCursor(
                this.props.activeView,
                this.props.views,
            )
            if (viewCursor !== this.state.viewCursor) {
                this.setState({ viewCursor })
            }
        }
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
                (view: Map<any, any>) => !view.get('hide', false),
            ) as List<any>
        }

        return this.props.views
    }

    _getViewCursor(activeView: Map<any, any>, views: List<any>) {
        return views.findIndex(
            (v: Map<any, any>) => v.get('id') === activeView.get('id'),
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
            },
        )
        this.setState({ viewCursor })

        const objectName = getPluralObjectName(this.props.viewType)
        const viewUrl = this._getViewUrl(
            objectName,
            displayedViews.get(viewCursor),
        )
        this._updateViewUrl(viewUrl)
    }

    _toggleHasEditMode = () => {
        const { hasEditMode } = this.state
        this.setState({ hasEditMode: !hasEditMode })
    }

    _getViewUrl = (objectName: string, view: Map<any, any>) => {
        return `/app/${objectName}/${view.get('id') as number}/${
            view.get('slug') as string
        }`
    }

    render() {
        const { activeView, viewType, settings, isLoading, closePanels } =
            this.props
        const { hasEditMode } = this.state
        // we use this to build urls
        const objectName = getPluralObjectName(viewType)

        const settingButtonClass = classnames(css.settingButton, {
            [css.active]: hasEditMode,
        })

        const displayedViews: List<any> = this._getDisplayedViews()

        return (
            <div>
                <div className={navbarCss.category}>
                    <h4 className={navbarCss['category-title']}>
                        <i
                            className={classnames(
                                'material-icons',
                                navbarCss.icon,
                            )}
                        >
                            view_list
                        </i>
                        Views
                        {/*
                        TODO(customers-migration): remove this condition when we finished to migrate views
                        */}
                        {viewType !== ViewType.CustomerList ? (
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
                    <div className={navbarCss.menu}>
                        {hasEditMode ? (
                            <ViewNavbarViewEditor
                                setting={settings}
                                views={displayedViews}
                                objectName={objectName}
                            />
                        ) : (
                            displayedViews
                                .toArray()
                                .map((view: Map<any, any>) => {
                                    const isCurrentView =
                                        activeView.get('id') === view.get('id')

                                    const key = `${view.get('slug') as string}-${
                                        view.get('id') as number
                                    }`
                                    const classes = classnames(navbarCss.link, {
                                        active: isCurrentView,
                                    })

                                    const viewCount = this.props.getViewCount(
                                        view.get('id'),
                                    )
                                    let count = ''
                                    let isMoreThanMaxCount = false

                                    if (viewCount !== null) {
                                        isMoreThanMaxCount =
                                            viewCount >=
                                            MAX_TICKET_COUNT_PER_VIEW
                                        count = `(${
                                            isMoreThanMaxCount
                                                ? `${
                                                      MAX_TICKET_COUNT_PER_VIEW -
                                                      1
                                                  }+`
                                                : viewCount
                                        })`
                                    }

                                    return (
                                        <div
                                            key={key}
                                            className={classnames(
                                                navbarCss['link-wrapper'],
                                                navbarCss.isNested,
                                            )}
                                        >
                                            <Link
                                                to={this._getViewUrl(
                                                    objectName,
                                                    view,
                                                )}
                                                className={classes}
                                                title={`${
                                                    view.get('name') as string
                                                } ${count}`}
                                                onClick={() => {
                                                    closePanels()
                                                }}
                                            >
                                                <span
                                                    className={
                                                        navbarCss['item-name']
                                                    }
                                                >
                                                    <ViewName
                                                        viewName={view.get(
                                                            'name',
                                                        )}
                                                    />
                                                </span>
                                                <span
                                                    className={
                                                        navbarCss['item-count']
                                                    }
                                                >
                                                    <ViewCount
                                                        viewCount={
                                                            viewCount ??
                                                            undefined
                                                        }
                                                        viewId={view.get('id')}
                                                        isDeactivated={false}
                                                        objectName={objectName}
                                                    />
                                                </span>
                                            </Link>
                                        </div>
                                    )
                                })
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState, props: OwnProps) => {
        const getSettingsByType = makeGetSettingsByType()
        const getViewsByType = makeGetViewsByType()
        return {
            getView: makeGetView(state),
            getViewCount: makeGetViewCount(state),
            activeView: getActiveView(state),
            views: getViewsByType(state, props.viewType),
            settings: getSettingsByType(state, props.settingType),
        }
    },
    { closePanels },
)

export default connector(ViewNavbarView)
