import type { LegacyColorType as ColorType } from '@gorgias/axiom'
import {
    LegacyBadge as Badge,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import { EditingStateEnum } from '../../constants'

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
        <Tooltip>
            <TooltipTrigger>
                <Badge type={options[state].badgeType as ColorType}>
                    <i className={'material-icons'}>{options[state].icon}</i>
                    {state}
                </Badge>
            </TooltipTrigger>
            <TooltipContent caption={options[state].tooltip} />
        </Tooltip>
    )
}

export default EditingState
