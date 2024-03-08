export enum CampaignTriggerOperator {
    Eq = 'eq',
    Neq = 'neq',
    Gt = 'gt',
    Gte = 'gte',
    Lt = 'lt',
    Lte = 'lte',
    In = 'in',
    NotIn = 'notIn',
    StartsWith = 'startsWith',
    EndsWith = 'endsWith',
    Contains = 'contains', // means contains ALL
    ContainsAll = 'containsAll', // deprecated
    ContainsAny = 'containsAny',
    NotContains = 'notContains',
}
