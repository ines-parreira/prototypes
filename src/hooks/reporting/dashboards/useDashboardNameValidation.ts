import {
    AnalyticsCustomReport,
    useListAnalyticsCustomReports,
} from '@gorgias/helpdesk-queries'

const validateDashboardName = (
    name: string,
    dashboards: AnalyticsCustomReport[],
    initialName?: string,
) => {
    const trimmedName = name.trim()

    if (initialName && trimmedName === initialName) {
        return undefined
    }

    if (trimmedName.length < 3) {
        return 'Name must be at least 3 characters long'
    }

    const isUnique = dashboards.every(
        (dashboard) => dashboard.name !== trimmedName,
    )
    if (!isUnique) {
        return `${trimmedName} already exists. Please create a unique name to save.`
    }

    return undefined
}

type ValidationResult =
    | {
          error: string
          isValid: false
          isInvalid: true
      }
    | {
          error: undefined
          isValid: true
          isInvalid: false
      }

export function useDashboardNameValidation(name: string, initialName?: string) {
    const { data } = useListAnalyticsCustomReports()

    const error = validateDashboardName(
        name,
        data?.data.data || [],
        initialName,
    )

    const isValid = !error
    const isInvalid = Boolean(error)

    return { error, isValid, isInvalid } as ValidationResult
}
