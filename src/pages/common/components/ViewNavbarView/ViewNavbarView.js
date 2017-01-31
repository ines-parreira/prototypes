import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import classnames from 'classnames'
import _assign from 'lodash/assign'
import {compactInteger, getPluralObjectName} from '../../../../utils'
import {Loader} from './../../../common/components/Loader'
import ViewNavbarViewEditor from './ViewNavbarViewEditor'
import {getActiveView, getViewsByType} from '../../../../state/views/selectors'
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
        currentView: PropTypes.object.isRequired,
        viewType: PropTypes.oneOf(['ticket-list', 'user-list']).isRequired,
        settings: PropTypes.object,
        settingType: PropTypes.oneOf(['ticket-views', 'user-views']).isRequired,
        isLoading: PropTypes.bool.isRequired,
        isUpdate: PropTypes.bool.isRequired,
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
        const {views, currentView, viewType, settings, isLoading, isUpdate} = this.props
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
                                    ? <Loader size="mini" inline inverted />
                                    : <i className={settingIconClass} />
                                }
                            </span>
                        </span>
                    </h4>
                    <div className="menu">
                        {
                            hasEditMode ? (
                                <ViewNavbarViewEditor
                                    initialValues={settings.toJS()}
                                    setting={settings}
                                    isUpdate={isUpdate}
                                    isLoading={isLoading}
                                    views={displayedViews}
                                    objectName={objectName}
                                />
                            ) : (
                                displayedViews.map((_view) => {
                                    const view = _view.toJS()
                                    const key = `${view.slug}-${view.id}`
                                    let classes = classnames('item', {
                                        active: currentView && currentView.get('id') === view.id
                                    })
                                    let count = 0

                                    if (view.count !== undefined && view.count !== null) {
                                        count = view.count
                                    }

                                    return (
                                        <Link
                                            key={key}
                                            to={`/app/${objectName}/${view.id}/${view.slug}`}
                                            className={classes}
                                        >
                                            {`${view.name} (${compactInteger(count)})`}
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
        currentView: getActiveView(state),
        views: getViewsByType(ownProps.viewType)(state),
        settings,
        isUpdate: !!settings.get('id'),
    }
}

export default connect(mapStateToProps)(ViewNavbarView)
