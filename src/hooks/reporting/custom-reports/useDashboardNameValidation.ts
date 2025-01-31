import {
    AnalyticsCustomReport,
    useListAnalyticsCustomReports,
} from '@gorgias/api-queries'

const validateDashboardName = (
    name: string,
    dashboards: AnalyticsCustomReport[],
    initialName?: string
) => {
    const trimmedName = name.trim()

    if (initialName && trimmedName === initialName) {
        return null
    }

    if (trimmedName.length < 3) {
        return 'Name must be at least 3 characters long'
    }

    const isUnique = dashboards.every(
        (dashboard) => dashboard.name !== trimmedName
    )
    if (!isUnique) {
        return `${trimmedName} already exists. Please create a unique name to save.`
    }

    return null
}

export function useDashboardNameValidation(name: string, initialName?: string) {
    const {data} = useListAnalyticsCustomReports()

    const error = validateDashboardName(
        name,
        data?.data.data || [],
        initialName
    )
    const isValid = !error
    const isInvalid = Boolean(error)

    return {error, isValid, isInvalid}
}
