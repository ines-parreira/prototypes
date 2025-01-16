import type {ColorTokens, ThemeName} from '@gorgias/design-tokens'

export type HelpdeskThemeName = ThemeName | 'system'

export type SetTheme = (theme: HelpdeskThemeName) => void

export type Theme = {
    name: HelpdeskThemeName
    resolvedName: ThemeName
    tokens: ColorTokens
}
