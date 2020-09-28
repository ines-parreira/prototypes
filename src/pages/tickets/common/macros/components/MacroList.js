// @flow
import React from 'react'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import type {Map} from 'immutable'

import InfiniteScroll from '../../../../common/components/InfiniteScroll'
import {scrollToReactNode} from '../../../../common/utils/keyboard.ts'
import {isMacroDisabled} from '../utils'
import {fetchMacros} from '../../../../../state/macro/actions.ts'

import css from './MacroList.less'

type Props = {
    macros: Map<*, *>,
    currentMacro: Map<*, *>,
    fetchMacros: typeof fetchMacros,
    onClickItem: (T: Map<*, *>) => void,
    onHoverItem: (T: Map<*, *>) => void,
    search: string,
    page: number,
    totalPages: number,
    className: string,
    disableExternalActions?: boolean,
}

export default class MacroList extends React.Component<Props> {
    _activeItem: ?Node

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

    _setActiveItem = (isActive: boolean, node: ?Node) => {
        if (!isActive || !node) {
            return
        }
        this._activeItem = node
    }

    render() {
        const {
            className,
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
                load={this._loadMacros}
                loadMore={page < totalPages}
            >
                {macros.map((macro) => {
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
