import {ColorType} from 'pages/common/components/Badge/Badge'

export const getEquivalentAutomationPlanId = (id: string) =>
    id.includes('automation') ? id : id.replace(/\-/, '-automation-')

export const getEquivalentRegularPlanId = (id: string) =>
    id.replace(/\-automation/, '')

export const PLAN_NAME_TO_BADGE_COLOR: Record<string, ColorType> = {
    Basic: ColorType.Classic,
    Pro: ColorType.Indigo,
    Advanced: ColorType.Success,
    Custom: ColorType.Warning,
    Enterprise: ColorType.Warning,
    Free: ColorType.Purple,
}
