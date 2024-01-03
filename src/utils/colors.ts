import {getContrast} from 'color2k'
import lightColorTokens from '@gorgias/design-tokens/dist/tokens/color/merchantLight.json'

const DEFAULT_CONTRAST_LEVEL = 3.5

export function getTextColorBasedOnBackground(
    backgroundColor: string,
    {
        contrastLevel = DEFAULT_CONTRAST_LEVEL,
        lightTextColor = lightColorTokens.Light.Neutral.Grey_0.value,
        darkTextColor = lightColorTokens.Light.Neutral.Grey_6.value,
    }: {
        contrastLevel?: number
        lightTextColor?: string
        darkTextColor?: string
    } = {}
) {
    try {
        const lightTextContrast = getContrast(backgroundColor, lightTextColor)
        return lightTextContrast >= contrastLevel
            ? lightTextColor
            : darkTextColor
    } catch (err) {
        return lightTextColor
    }
}
