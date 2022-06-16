import React from 'react'
import classnames from 'classnames'
import Tooltip from 'pages/common/components/Tooltip'
import {EditingStateEnum} from '../../constants'

import css from './EditingState.less'

export type EditingStateProps = {
    state: EditingStateEnum
}

const EditingState = ({state}: EditingStateProps) => {
    const options = {
        [EditingStateEnum.PUBLISHED]: {
            icon: 'verified',
            tooltip: 'Article content reflects the published version.',
        },
        [EditingStateEnum.UNSAVED]: {
            icon: 'edit',
            tooltip: 'Recent changes to this article have not been saved.',
        },
        [EditingStateEnum.SAVED]: {
            icon: 'save',
            tooltip: 'Recent saved changes to this article are unpublished.',
        },
    }

    return (
        <>
            <span
                id="editingState"
                className={classnames(
                    css.editingState,
                    css[state.toLowerCase()]
                )}
            >
                <i className={classnames('material-icons', css.icon)}>
                    {options[state].icon}
                </i>
                {state}
            </span>
            <Tooltip
                target="editingState"
                placement="bottom-end"
                innerClassName={css.tooltip}
            >
                {options[state].tooltip}
            </Tooltip>
        </>
    )
}

export default EditingState
