import React, {PropTypes, Component} from 'react'
import {Link} from 'react-router'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import _assign from 'lodash/assign'
import {compactInteger, getPluralObjectName} from '../../../../utils'
import {Loader} from './../../../common/components/Loader'
import ViewNavbarViewEditor from './ViewNavbarViewEditor'
import {sortViews} from './utils'
import css from './ViewNavbarView.less'

// popup configuration
const popupConf = {
    variation: 'inverted',
    position: 'top center'
}
const popupEnterMessage = 'Edit views list'
const popupLeaveMessage = 'Leave edit mode'

// Component used to display a list of views in the navbar
class ViewNavbarView extends Component {
    static propTypes = {
        views: PropTypes.object.isRequired,
        currentView: PropTypes.object.isRequired,
        viewType: PropTypes.oneOf(['ticket-list', 'user-list']).isRequired,
        setting: PropTypes.object,
        settingType: PropTypes.oneOf(['ticket-views', 'user-views']).isRequired,
        isLoading: PropTypes.bool.isRequired,
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
        const {views, currentView, viewType, settingType, isLoading} = this.props
        const {hasEditMode} = this.state
        // we use this to build urls
        const objectName = getPluralObjectName(viewType)
        const isUpdate = !!this.props.setting
        const settingButtonClass = classnames(css['setting-button'], {
            [css.active]: hasEditMode
        })
        const settingIconClass = classnames({
            setting: !hasEditMode,
            remove: hasEditMode
        }, 'icon', 'm0i')
        let setting = this.props.setting || fromJS({
            type: settingType,
            data: {}
        })
        let displayedViews = views
            .get('items', fromJS([]))
            .filter(view => view.get('type') === viewType)

        // merge user setting for views with setting of views
        const mergedViews = displayedViews
            .map((view) => {
                const viewId = view.get('id')
                const viewSetting = setting.getIn(['data', viewId.toString()], fromJS({}))
                // define actual setting based on view data and user setting
                const hide = viewSetting.get('hide', false)
                const displayOrder = viewSetting.get('display_order', view.get('display_order', 0))

                // apply merged setting on view and setting
                setting = setting
                    .setIn(['data', viewId.toString(), 'hide'], hide)
                    .setIn(['data', viewId.toString(), 'display_order'], displayOrder)
                return view
                    .set('hide', hide)
                    .set('display_order', displayOrder)
            })
            .sort(sortViews)

        // hide hidden views if we are not in edit mode
        if (!hasEditMode) {
            displayedViews = mergedViews
                .filter(view => !view.get('hide', false))
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
                        {hasEditMode ?
                            <ViewNavbarViewEditor
                                initialValues={setting.toJS()}
                                setting={setting}
                                isUpdate={isUpdate}
                                isLoading={isLoading}
                                views={mergedViews}
                                objectName={objectName}
                            />
                            :
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
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default ViewNavbarView
