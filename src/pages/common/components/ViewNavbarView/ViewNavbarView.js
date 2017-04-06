import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import classnames from 'classnames'
import {compactInteger, getPluralObjectName} from '../../../../utils'
import {Loader} from './../../../common/components/Loader'
import ViewNavbarViewEditor from './ViewNavbarViewEditor'
import _assign from 'lodash/assign'

import * as viewsActions from '../../../../state/views/actions'
import {getActiveView, getViewsByType, makeGetView, makeGetViewCount} from '../../../../state/views/selectors'
import {getSettingsByType as getCurrentUserSettingsByType} from '../../../../state/currentUser/selectors'

import css from './ViewNavbarView.less'

// popup configuration
const popupConf = {
    variation: 'inverted',
    position: 'top center'
}
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
        isUpdate: PropTypes.bool.isRequired,
        fetchPage: PropTypes.func.isRequired,
        getViewCount: PropTypes.func.isRequired,
    }

    state = {
        hasEditMode: false
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.refs.settingButton) {
                $(this.refs.settingButton).popup(_assign({}, popupConf, {
                    content: popupEnterMessage
                }))
            }
        }, 1)
    }

    _toggleHasEditMode = () => {
        const {hasEditMode} = this.state
        this.setState({hasEditMode: !hasEditMode})

        setTimeout(() => {
            if (this.refs.settingButton) {
                $(this.refs.settingButton).popup(_assign({}, popupConf, {
                    content: hasEditMode ? popupEnterMessage : popupLeaveMessage
                }))
            }
        }, 1)
    }

    render() {
        const {views, activeView, viewType, settings, isLoading, isUpdate} = this.props
        const {hasEditMode} = this.state
        // we use this to build urls
        const objectName = getPluralObjectName(viewType)

        const settingButtonClass = classnames(css['setting-button'], {
            [css.active]: hasEditMode
        })
        const settingIconClass = classnames('icon m0i', {
            setting: !hasEditMode,
            remove: hasEditMode
        })

        let displayedViews = views

        // hide hidden views if we are not in edit mode
        if (!hasEditMode) {
            displayedViews = displayedViews.filter(view => !view.get('hide', false))
        }

        return (
            <div>
                <div className="item">
                    <h4>
                        VIEWS
                        <span
                            onClick={this._toggleHasEditMode}
                            className={settingButtonClass}
                        >
                            <span ref="settingButton">
                                {isLoading
                                    ? <Loader size="mini" inline inverted/>
                                    : <i className={settingIconClass}/>
                                }
                            </span>
                        </span>
                    </h4>
                    <div className="menu">
                        {
                            hasEditMode ?
                                <ViewNavbarViewEditor
                                    initialValues={settings.toJS()}
                                    setting={settings}
                                    isUpdate={isUpdate}
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
                                                to={`/app/${objectName}/${view.get('id')}/${view.get('slug')}`}
                                                className={classes}
                                                title={`${view.get('name')} ${count}`}
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
        isUpdate: !!settings.get('id'),
    }
}

const mapDispatchToProps = {
    fetchPage: viewsActions.fetchPage,
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewNavbarView)
