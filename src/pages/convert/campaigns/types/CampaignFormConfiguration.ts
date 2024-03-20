import {CampaignStepsKeys} from './CampaignSteps'

export enum TooltipActionType {
    Link = 'link',
    Product = 'product',
    Discount = 'discount',
}

export type ToolbarActionConfiguration = {
    tooltipContent: string
}

export enum BannerType {
    Info = 'info',
    Warning = 'warning',
}

export type Banner = {
    type: BannerType
    content: string
}

export type WizardStepConfiguration = {
    banner?: Banner
}

export type WizardConfiguration = {
    defaultStepOpened?: CampaignStepsKeys
    stepConfiguration?: Record<string, WizardStepConfiguration>
    toolbarConfiguration?: Record<string, ToolbarActionConfiguration>
}
