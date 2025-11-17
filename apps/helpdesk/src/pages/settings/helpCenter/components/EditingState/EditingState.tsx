import type { ColorType } from '@gorgias/axiom'
import { Badge, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { EditingStateEnum } from '../../constants'

import css from './EditingState.less'

export type EditingStateProps = {
    state: EditingStateEnum
}

const EditingState = ({ state }: EditingStateProps) => {
    const options = {
        [EditingStateEnum.PUBLISHED]: {
            icon: 'check_circle',
            badgeType: 'light-purple',
            tooltip: 'Article content reflects the published version.',
        },
        [EditingStateEnum.UNSAVED]: {
            icon: 'edit',
            badgeType: 'light-grey',
            tooltip: 'Recent changes to this article have not been saved.',
        },
        [EditingStateEnum.SAVED]: {
            icon: 'save',
            badgeType: 'light-success',
            tooltip: 'Recent saved changes to this article are unpublished.',
        },
    }

    return (
        <>
            <Badge
                id="editingState"
                type={options[state].badgeType as ColorType}
            >
                <i className={'material-icons'}>{options[state].icon}</i>
                {state}
            </Badge>
            <Tooltip
                target="editingState"
                placement="bottom"
                innerProps={{
                    innerClassName: css.tooltip,
                }}
            >
                {options[state].tooltip}
            </Tooltip>
        </>
    )
}

export default EditingState
