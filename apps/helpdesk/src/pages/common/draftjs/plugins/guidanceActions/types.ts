export type MissingValuesDetail = {
    templateName?: string
    inputNames: string[]
}

export type GuidanceAction = {
    name: string
    value: string
    enabled?: boolean
    requiresAuth?: boolean
    hasMissingValues?: boolean
    missingValuesDetails?: MissingValuesDetail[]
}

export const isActionSetupRequired = (action: GuidanceAction): boolean =>
    action.enabled === false ||
    action.requiresAuth === true ||
    action.hasMissingValues === true
