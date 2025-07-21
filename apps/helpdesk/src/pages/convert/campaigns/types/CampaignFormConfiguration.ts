import {
    ActionName,
    TooltipTourConfigurationType,
} from 'pages/common/draftjs/plugins/toolbar/types'

import { CampaignStepsKeys } from './CampaignSteps'

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
    isDisabled?: boolean
}

export enum Label {
    Create = 'Create',
    Update = 'Update',
    Duplicate = 'Duplicate',
    Cancel = 'Cancel',
}

export type WizardConfiguration = {
    defaultStepOpened?: CampaignStepsKeys
    stepConfiguration?: Record<string, WizardStepConfiguration>
    toolbarConfiguration?: Record<string, ToolbarActionConfiguration>
    labels?: Partial<Record<Label, string>>
}

export type UtmConfiguration = {
    utmEnabled: boolean
    utmQueryString: string
    appliedUtmQueryString: string
    appliedUtmEnabled: boolean
    onUtmEnabledChange: (value: boolean) => void
    onUtmQueryStringChange: (string: string) => void
    onUtmApply: (save: boolean) => Promise<void>
    onUtmReset: () => void
}
