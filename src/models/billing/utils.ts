export const getEquivalentAutomationPlanId = (id: string) =>
    id.includes('automation') ? id : id.replace(/\-/, '-automation-')

export const getEquivalentRegularPlanId = (id: string) =>
    id.replace(/\-automation/, '')
