// @flow
import React from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'

import Cell from './Cell'
import {scrollToReactNode} from '../../../utils/keyboard'

import css from '../Table.less'

import * as agentSelectors from '../../../../../state/agents/selectors'
import * as viewsActions from '../../../../../state/views/actions'

import * as viewsUtils from '../../../../../state/views/utils'

import type {Map, List} from 'immutable'

type Props = {
    onItemClick: ?(number) => void,
    itemUrl: ?string,
    fields: List<*>,
    item: Map<*,*>,
    isSelected: boolean,
    hasCursor: boolean,
    selectable: ?boolean,
    type: string,

    toggleSelection: typeof viewsActions.toggleSelection,
    getAgentsViewing: typeof agentSelectors.makeGetOtherAgentsOnTicket,
}

class Row extends React.Component<Props> {
    static defaultProps = {
        item: fromJS({}),
        selectable: true,
    }

    componentDidUpdate(prevProps) {
        // only if it just got the cursor.
        // to prevent focusing on the cursor item when a different one updates.
        if (this.props.hasCursor && !prevProps.hasCursor) {
            scrollToReactNode(this)
        }
    }

    _toggleSelection = () => {
        this.props.toggleSelection(this.props.item.get('id'))
    }

    render() {
        const {
            fields, getAgentsViewing, item, isSelected, selectable, type, hasCursor,onItemClick, itemUrl
        } = this.props

        const agentsViewing = getAgentsViewing(item.get('id'))

        return (
            <tr
                className={classnames({
                    highlighted: item.get('is_unread'),
                    [css['has-cursor']]: hasCursor
                })}
            >
                {
                    selectable ? (
                        <td
                            className="cell-wrapper cell-short clickable d-none d-md-table-cell"
                            onClick={this._toggleSelection}
                        >
                            {
                                // display an eye on row if an agent is currently viewing this item
                                agentsViewing.size > 0 && (
                                    <div
                                        className={css.viewers}
                                        title={viewsUtils.agentsViewingMessage(agentsViewing)}
                                    >
                                        <i className="material-icons">remove_red_eye</i>
                                    </div>
                                )
                            }
                            <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                            />
                        </td>
                    ) : null
                }
                {
                    fields.map((field) => (
                        <Cell
                            key={`${item.get('id')}-${field.get('name')}`}
                            item={item}
                            field={field}
                            type={type}
                            onClick={onItemClick}
                            itemUrl={itemUrl}
                        />
                    ))
                }
            </tr>
        )
    }
}

export default connect((state) => {
    return {
        getAgentsViewing: agentSelectors.makeGetOtherAgentsOnTicket(state),
    }
}, {
    toggleSelection: viewsActions.toggleSelection,
})(Row)
