import React, {Component} from 'react'
import classnames from 'classnames'
import _noop from 'lodash/noop'
import {List, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import InfiniteScroll from '../../../../common/components/InfiniteScroll/InfiniteScroll'
import {scrollToReactNode} from '../../../../common/utils/keyboard'
import {isMacroDisabled} from '../utils'
import {fetchMacrosParamsTypes} from '../../../../../state/macro/actions'
import {getCurrentUser} from '../../../../../state/currentUser/selectors'
import * as segmentTracker from '../../../../../store/middlewares/segmentTracker.js'
import {RootState} from '../../../../../state/types'

import css from './MacroList.less'

type Props = {
    macros: List<any>
    currentMacro: Map<any, any>
    onClickItem: (item: Map<any, any>) => void
    onHoverItem: (item: Map<any, any>) => void
    search: string
    page: number
    totalPages: number
    className: string
    disableExternalActions?: boolean
    fetchMacros: (params: fetchMacrosParamsTypes) => Promise<void>
} & ConnectedProps<typeof connector>

export class MacroListContainer extends Component<Props> {
    _activeItem: HTMLElement | null = null

    static defaultProps = {
        onClickItem: _noop,
        onHoverItem: _noop,
    }

    componentDidUpdate(prevProps: Props) {
        if (
            prevProps.currentMacro.get('id') !==
                this.props.currentMacro.get('id') &&
            this._activeItem
        ) {
            scrollToReactNode(this._activeItem)
        }
    }

    _loadMacros = () => {
        return this.props.fetchMacros({
            search: this.props.search,
            page: this.props.page + 1,
        })
    }

    _setActiveItem = (isActive: boolean, node: HTMLElement | null) => {
        if (!isActive || !node) {
            return
        }
        this._activeItem = node
    }

    render() {
        const {
            className,
            currentUser,
            currentMacro,
            macros,
            page,
            totalPages,
            disableExternalActions,
            onClickItem,
            onHoverItem,
        } = this.props

        return (
            <InfiniteScroll
                className={classnames(css.component, className)}
                onLoad={this._loadMacros as any}
                shouldLoadMore={page < totalPages}
            >
                {macros.map((macro: Map<any, any>) => {
                    const isDisabled = isMacroDisabled(
                        macro,
                        disableExternalActions
                    )
                    const isActive =
                        currentMacro &&
                        macro.get('id') === currentMacro.get('id')
                    return (
                        <div
                            key={macro.get('id')}
                            className={classnames(css.item, {
                                [css.active]: isActive,
                                [css.disabled]: isDisabled,
                            })}
                            onClick={() => {
                                if (isDisabled) {
                                    return
                                }
                                segmentTracker.logEvent(
                                    segmentTracker.EVENTS
                                        .MACRO_APPLIED_SEARCHBAR,
                                    {user_id: currentUser.get('id')}
                                )
                                onClickItem(macro)
                            }}
                            onMouseEnter={() => onHoverItem(macro)}
                            ref={(ref) => this._setActiveItem(isActive, ref)}
                        >
                            {macro.get('name')}
                        </div>
                    )
                })}
            </InfiniteScroll>
        )
    }
}

const connector = connect((state: RootState) => ({
    currentUser: getCurrentUser(state),
}))

export default connector(MacroListContainer)
