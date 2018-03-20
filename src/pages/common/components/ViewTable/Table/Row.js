// @flow
import React from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'

import Cell from './Cell'
import {scrollToReactNode} from '../../../utils/keyboard'

import css from '../Table.less'

import * as usersSelectors from '../../../../../state/users/selectors'
import * as viewsActions from '../../../../../state/views/actions'

import * as viewsUtils from '../../../../../state/views/utils'

import type {Map, List} from 'immutable'

type Props = {
    link: string,
    fields: List<*>,
    item: Map<*,*>,
    isSelected: boolean,
    hasCursor: boolean,
    type: string,

    toggleSelection: typeof viewsActions.toggleSelection,
    getAgentsViewing: typeof usersSelectors.makeGetOtherAgentsOnTicket,
}

class Row extends React.Component<Props> {
    static defaultProps = {
        item: fromJS({}),
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
        const {fields, getAgentsViewing, item, isSelected, type, hasCursor, link} = this.props

        const agentsViewing = getAgentsViewing(item.get('id'))

        return (
            <tr
                className={classnames({
                    highlighted: item.get('is_unread'),
                    [css['has-cursor']]: hasCursor
                })}
            >
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
                    />
                </td>
                {
                    fields.map((field) => (
                        <Cell
                            key={`${item.get('id')}-${field.get('name')}`}
                            link={link}
                            item={item}
                            field={field}
                            type={type}
                        />
                    ))
                }
            </tr>
        )
    }
}

export default connect((state) => {
    return {
        getAgentsViewing: usersSelectors.makeGetOtherAgentsOnTicket(state),
    }
}, {
    toggleSelection: viewsActions.toggleSelection,
})(Row)
