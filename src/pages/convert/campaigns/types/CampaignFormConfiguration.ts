import {
    ActionName,
    TooltipTourConfigurationType,
} from 'pages/common/draftjs/plugins/toolbar/types'

import {CampaignStepsKeys} from './CampaignSteps'

export enum TooltipActionType {
    Link = ActionName.Link,
    Product = ActionName.ProductPicker,
    Discount = ActionName.DiscountCodePicker,
}

export type ToolbarActionConfiguration = TooltipTourConfigurationType

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
