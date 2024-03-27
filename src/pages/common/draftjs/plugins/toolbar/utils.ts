import {TooltipTourConfigurationType} from './types'

export const getTooltipTourConfiguration = (
    action: string,
    configuration: Record<string, TooltipTourConfigurationType> | undefined
) => {
    if (!configuration || !(action in configuration)) {
        return undefined
    }

    return {
        text: configuration[action]?.tooltipContent,
    }
}
