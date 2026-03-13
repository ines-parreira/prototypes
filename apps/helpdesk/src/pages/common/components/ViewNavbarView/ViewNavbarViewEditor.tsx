import React, { Component } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _isUndefined from 'lodash/isUndefined'
import _merge from 'lodash/merge'
import _pick from 'lodash/pick'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import type { RouteComponentProps } from 'react-router-dom'
import { Link } from 'react-router-dom'

import ReactSortable from 'pages/common/components/dragging/ReactSortable'
import CheckBox from 'pages/common/forms/CheckBox'
import withRouter from 'pages/common/utils/withRouter'
import { submitSetting } from 'state/currentUser/actions'

import { sortViews } from './utils'

import css from './ViewNavbarViewEditor.less'

type OwnProps = {
    views: List<any>
    objectName: string
    setting: Map<any, any>
}

type Props = RouteComponentProps & OwnProps & ConnectedProps<typeof connector>

type State = {
    hide: Record<string, boolean>
    displayOrder: Record<string, number>
}

class ViewNavbarViewEditor extends Component<Props, State> {
    static defaultProps: Pick<Props, 'setting'> = {
        setting: fromJS({}),
    }

    constructor(props: Props) {
        super(props)

        this.state = _merge(
            {
                hide: {},
                displayOrder: {},
            },
            this._getSettings(props.views),
        )
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.views !== this.props.views) {
            this.setState(
                _merge(this._getSettings(this.props.views), this.state),
            )
        }
    }

    _getSettings = (views: List<any>) => {
        const newSettings: State = {
            hide: {},
            displayOrder: {},
        }

        views.forEach((view: Map<any, any>) => {
            const viewId = view.get('id') as number
            newSettings.hide[`${viewId}`] = view.get('hide') as boolean
            newSettings.displayOrder[`${viewId}`] = view.get('display_order')
        })

        return newSettings
    }

    _submitSetting = () => {
        const oldSettings: Record<
            string,
            { hide: boolean; display_order: number }
        > = {}
        this.props.views.forEach((view: Map<any, any>) => {
            oldSettings[view.get('id') as number] = _pick(view.toJS(), [
                'hide',
                'display_order',
            ])
        })

        const newSettings: Record<string, Record<string, boolean | number>> = {}

        const properties = [
            { local: 'hide', remote: 'hide' },
            { local: 'displayOrder', remote: 'display_order' },
        ]

        properties.forEach(
            ({ local, remote }: { local: string; remote: string }) => {
                Object.keys((this.state as Record<string, any>)[local]).forEach(
                    (id: string) => {
                        newSettings[id] = newSettings[id] || {}
                        newSettings[id][remote] = (
                            this.state as Record<
                                string,
                                Record<string, boolean | number>
                            >
                        )[local][id]
                    },
                )
            },
        )

        return this.props.submitSetting(
            _merge(this.props.setting.toJS(), {
                data: _merge(oldSettings, newSettings),
            }),
            false,
        )
    }

    _updateField = (value: { hide: Record<string, boolean> }) => {
        this.setState(_merge(this.state, value))
        void this._submitSetting()

        logEvent(SegmentEvent.NavbarViewToggled)
    }

    _updateOrder = (orders: string[]) => {
        const newDisplayOrder: Record<string, number> = {}

        orders.forEach((id: string, index: number) => {
            newDisplayOrder[id] = index
        })

        this.setState(
            _merge(this.state, {
                displayOrder: newDisplayOrder,
            }),
        )

        void this._submitSetting()

        logEvent(SegmentEvent.NavbarViewMoved)
    }

    _getDisplayOrder = (view: Map<any, any>) => {
        const displayOrder =
            this.state.displayOrder[(view.get('id') as number).toString()]

        if (_isUndefined(displayOrder)) {
            return view.get('display_order') as number
        }

        return displayOrder
    }

    _renderViews = (views: List<any>) => {
        let newView = views

        // re-sort views with `display_order` values of the form
        if (Object.keys(this.state.displayOrder).length > 0) {
            newView = newView
                .map((view: Map<any, any>) => {
                    return view.set(
                        'display_order',
                        this._getDisplayOrder(view),
                    )
                })
                .sort(
                    sortViews as unknown as (
                        view1: Map<any, any>,
                        view2: Map<any, any>,
                    ) => number,
                ) as List<any>
        }

        return newView.toArray().map((view: Map<any, any>) => {
            const viewId = view.get('id')

            return (
                <div
                    key={viewId}
                    data-id={viewId}
                    className={classnames('item', css.viewItem, {
                        [css.draggable]: !view.get('hide'),
                    })}
                >
                    <CheckBox
                        name={`hide.${viewId as number}`}
                        isChecked={
                            !this.state.hide[(viewId as number).toString()]
                        }
                        onChange={(value: boolean) =>
                            this._updateField({
                                hide: {
                                    [`${viewId as number}`]: !value,
                                },
                            })
                        }
                    >
                        {view.get('name')}
                    </CheckBox>
                </div>
            )
        })
    }

    render() {
        const {
            views,
            objectName,
            location: { pathname },
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

const connector = connect(null, {
    submitSetting,
})

export default withRouter(connector(ViewNavbarViewEditor))
