import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import {Link, browserHistory} from 'react-router'
import classnames from 'classnames'
import {UncontrolledTooltip} from 'reactstrap'
import _debounce from 'lodash/debounce'

import {compactInteger, getPluralObjectName} from '../../../../utils'
import ViewNavbarViewEditor from './ViewNavbarViewEditor'

import shortcutManager from '../../../../services/shortcutManager'
import {moveIndex} from '../../../common/utils/keyboard'

import * as viewsActions from '../../../../state/views/actions'
import {getActiveView, getViewsByType, makeGetView, makeGetViewCount} from '../../../../state/views/selectors'
import {getSettingsByType as getCurrentUserSettingsByType} from '../../../../state/currentUser/selectors'

import css from './ViewNavbarView.less'

const popupEnterMessage = 'Create, re-order & hide views'
const popupLeaveMessage = 'Leave edit mode'

// Component used to display a list of views in the navbar
class ViewNavbarView extends Component {
    static propTypes = {
        views: PropTypes.object.isRequired,
        activeView: PropTypes.object.isRequired,
        viewType: PropTypes.oneOf(['ticket-list', 'user-list']).isRequired,
        settings: PropTypes.object,
        settingType: PropTypes.oneOf(['ticket-views', 'user-views']).isRequired,
        isLoading: PropTypes.bool.isRequired,
        fetchPage: PropTypes.func.isRequired,
        getViewCount: PropTypes.func.isRequired,
    }

    static contextTypes = {
        closePanel: PropTypes.func.isRequired,
    }

    state = {
        hasEditMode: false,
        viewCusor: 0
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('ViewNavbarView')
    }

    componentWillReceiveProps(nextProps) {
        this.setState({viewCursor: this._getViewCursor(nextProps.activeView, nextProps.views)})
    }

    _bindKeys = () => {
        shortcutManager.bind('ViewNavbarView', {
            GO_NEXT_VIEW: {
                action: () => this._moveCursor()
            },
            GO_PREV_VIEW: {
                action: () => this._moveCursor('previous')
            },
        })
    }

    _getDisplayedViews = () => {
        // hide hidden views if we are not in edit mode
        if (!this.state.hasEditMode) {
            return this.props.views.filter(view => !view.get('hide', false))
        }

        return this.props.views
    }

    _getViewCursor(activeView, views) {
        return views.findIndex((v) => v.get('id') === activeView.get('id'))
    }

    _updateViewUrl = _debounce((viewUrl) => {
        browserHistory.push(viewUrl)
    })

    _moveCursor = (direction: string = 'next') => {
        const displayedViews = this._getDisplayedViews()
        const viewCursor = moveIndex(this.state.viewCursor, displayedViews.size, {
            direction,
            rotate: true
        })
        this.setState({viewCursor})

        const objectName = getPluralObjectName(this.props.viewType)
        const viewUrl = this._getViewUrl(objectName, displayedViews.get(viewCursor))
        this._updateViewUrl(viewUrl)
    }

    _toggleHasEditMode = () => {
        const {hasEditMode} = this.state
        this.setState({hasEditMode: !hasEditMode})
    }

    _getViewUrl = (objectName, view) => {
        return `/app/${objectName}/${view.get('id')}/${view.get('slug')}`
    }

    render() {
        const {activeView, viewType, settings, isLoading} = this.props
        const {hasEditMode} = this.state
        // we use this to build urls
        const objectName = getPluralObjectName(viewType)

        const settingButtonClass = classnames(css['setting-button'], {
            [css.active]: hasEditMode
        })

        let displayedViews = this._getDisplayedViews()

        return (
            <div>
                <div className="item">
                    <h4>
                        Views
                        <span
                            onClick={this._toggleHasEditMode}
                            className={settingButtonClass}
                        >
                            <span id="navbar-views-settings">
                                {isLoading
                                    ? (
                                        <i className="fa fa-fw fa-circle-o-notch fa-spin" />
                                    ) : (
                                        <i
                                            className={classnames('hidden-sm-down fa fa-fw', {
                                                'fa-cog': !hasEditMode,
                                                'fa-close': hasEditMode
                                            })}
                                        />
                                    )
                                }
                            </span>
                            <UncontrolledTooltip
                                delay={0}
                                placement="top"
                                target="navbar-views-settings"
                            >
                                {hasEditMode ? popupLeaveMessage : popupEnterMessage}
                            </UncontrolledTooltip>
                        </span>
                    </h4>
                    <div className="menu">
                        {
                            hasEditMode ?
                                <ViewNavbarViewEditor
                                    initialValues={settings.toJS()}
                                    setting={settings}
                                    isLoading={isLoading}
                                    views={displayedViews}
                                    objectName={objectName}
                                />
                                : (
                                    displayedViews.map((view) => {
                                        const isCurrentView = activeView.get('id') === view.get('id')

                                        const key = `${view.get('slug')}-${view.get('id')}`
                                        let classes = classnames('item', {
                                            active: isCurrentView,
                                        })

                                        const viewCount = this.props.getViewCount(view.get('id'))
                                        const count = `(${viewCount})`
                                        const compactCount = `(${compactInteger(viewCount)})`

                                        return (
                                            <Link
                                                key={key}
                                                to={this._getViewUrl(objectName, view)}
                                                className={classes}
                                                title={`${view.get('name')} ${count}`}
                                                onClick={() => {
                                                    this.context.closePanel()
                                                }}
                                            >
                                                {`${view.get('name')} ${compactCount}`}
                                            </Link>
                                        )
                                    })
                                )
                        }
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    const settings = getCurrentUserSettingsByType(ownProps.settingType)(state)

    return {
        getView: makeGetView(state),
        getViewCount: makeGetViewCount(state),
        activeView: getActiveView(state),
        views: getViewsByType(ownProps.viewType)(state),
        settings,
    }
}

const mapDispatchToProps = {
    fetchPage: viewsActions.fetchPage,
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewNavbarView)
