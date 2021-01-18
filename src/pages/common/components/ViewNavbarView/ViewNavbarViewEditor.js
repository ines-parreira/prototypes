import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router-dom'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import _pick from 'lodash/pick'
import _merge from 'lodash/merge'
import _isUndefined from 'lodash/isUndefined'

import BooleanField from '../../forms/BooleanField'

import * as segmentTracker from '../../../../store/middlewares/segmentTracker'
import {submitSetting} from '../../../../state/currentUser/actions.ts'

import ReactSortable from './../../../common/components/dragging/ReactSortable'
import {sortViews} from './utils'

import css from './ViewNavbarViewEditor.less'

class ViewNavbarViewEditor extends Component {
    static propTypes = {
        views: PropTypes.object.isRequired,
        objectName: PropTypes.string.isRequired,
        submitSetting: PropTypes.func.isRequired,
        setting: PropTypes.object,
        location: PropTypes.object.isRequired,
    }

    static defaultProps = {
        setting: fromJS({}),
    }

    constructor(props) {
        super(props)

        this.state = _merge(
            {
                hide: {},
                displayOrder: {},
            },
            this._getSettings(props.views)
        )
    }

    componentWillReceiveProps(nextProps) {
        this.setState(_merge(this._getSettings(nextProps.views), this.state))
    }

    _getSettings = (views) => {
        const newSettings = {
            hide: {},
            displayOrder: {},
        }

        views.forEach((view) => {
            const viewId = view.get('id')
            newSettings.hide[`${viewId}`] = view.get('hide')
            newSettings.displayOrder[`${viewId}`] = view.get('display_order')
        })

        return newSettings
    }

    _submitSetting = () => {
        const oldSettings = {}
        this.props.views.forEach((view) => {
            oldSettings[view.get('id')] = _pick(view.toJS(), [
                'hide',
                'display_order',
            ])
        })

        const newSettings = {}
        const properties = [
            {local: 'hide', remote: 'hide'},
            {local: 'displayOrder', remote: 'display_order'},
        ]

        properties.forEach(({local, remote}) => {
            Object.keys(this.state[local]).forEach((id) => {
                newSettings[id] = newSettings[id] || {}
                newSettings[id][remote] = this.state[local][id]
            })
        })

        return this.props.submitSetting(
            _merge(this.props.setting.toJS(), {
                data: _merge(oldSettings, newSettings),
            })
        )
    }

    _updateField = (value) => {
        this.setState(_merge(this.state, value))

        this._submitSetting()

        segmentTracker.logEvent(segmentTracker.EVENTS.NAVBAR_VIEW_TOGGLED)
    }

    _updateOrder = (orders) => {
        const newDisplayOrder = {}

        orders.forEach((id, index) => {
            newDisplayOrder[id] = index
        })

        this.setState(
            _merge(this.state, {
                displayOrder: newDisplayOrder,
            })
        )

        this._submitSetting()

        segmentTracker.logEvent(segmentTracker.EVENTS.NAVBAR_VIEW_MOVED)
    }

    _getDisplayOrder = (view) => {
        const displayOrder = this.state.displayOrder[view.get('id').toString()]

        if (_isUndefined(displayOrder)) {
            return view.get('display_order')
        }

        return displayOrder
    }

    _renderViews = (views) => {
        let newView = views

        // re-sort views with `display_order` values of the form
        if (Object.keys(this.state.displayOrder).length > 0) {
            newView = newView
                .map((view) => {
                    return view.set(
                        'display_order',
                        this._getDisplayOrder(view)
                    )
                })
                .sort(sortViews)
        }

        return newView.map((view) => {
            const viewId = view.get('id')

            return (
                <div
                    key={viewId}
                    data-id={viewId}
                    className={classnames('item', css.viewItem, {
                        [css.draggable]: !view.get('hide'),
                    })}
                >
                    <BooleanField
                        label={view.get('name')}
                        name={`hide.${viewId}`}
                        value={!this.state.hide[viewId.toString()]}
                        onChange={(value) =>
                            this._updateField({
                                hide: {
                                    [`${viewId}`]: !value,
                                },
                            })
                        }
                        inline
                    />
                </div>
            )
        })
    }

    render() {
        const {
            views,
            objectName,
            location: {pathname},
        } = this.props
        const createButtonClass = classnames('mt10 item', {
            active: pathname.includes(`${objectName}/new`),
        })

        return (
            <div>
                <ReactSortable
                    options={{
                        sort: true,
                        draggable: `.${css.draggable}`,
                        chosenClass: css.chosen,
                        ghostClass: css.ghost,
                        animation: 150,
                    }}
                    onChange={this._updateOrder}
                >
                    {this._renderViews(views)}
                </ReactSortable>
                <Link
                    className={createButtonClass}
                    to={`/app/${objectName}/new`}
                >
                    <div>
                        <i className="material-icons mr-2">add</i>
                        Create new view
                    </div>
                </Link>
            </div>
        )
    }
}

const ViewNavbarViewEditorWithRouter = withRouter(ViewNavbarViewEditor)

export default connect(null, {
    submitSetting,
})(ViewNavbarViewEditorWithRouter)
