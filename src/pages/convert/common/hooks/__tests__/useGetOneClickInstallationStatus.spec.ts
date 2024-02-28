import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import {
    GorgiasChatInstallationMethod,
    GorgiasChatIntegration,
} from 'models/integration/types'
import {
    ONE_CLICK_INSTALLED,
    useGetOneClickInstallationStatus,
} from 'pages/convert/common/hooks/useGetOneClickInstallationStatus'

const integrationWithScriptTagAndValidDates = {
    meta: {
        one_click_installation_method: GorgiasChatInstallationMethod.ScriptTag,
        one_click_installation_datetime: moment()
            .subtract(1, 'days')
            .toISOString(),
        one_click_uninstallation_datetime: moment().toISOString(),
    },
} as GorgiasChatIntegration

describe('useGetOneClickInstallationStatus', () => {
    const integration = {
        meta: {
            one_click_installation_method:
                GorgiasChatInstallationMethod.ScriptTag,
            one_click_installation_datetime: moment().toISOString(),
        },
    } as GorgiasChatIntegration

    it('should return "installed" for a valid installation without an uninstallation date', () => {
        const {result} = renderHook(() =>
            useGetOneClickInstallationStatus(integration)
        )
        expect(result.current).toBe(ONE_CLICK_INSTALLED)
    })

    it('should return null for an invalid installation method', () => {
        const invalidMethodIntegration = {
            ...integration,
            meta: {
                ...integrationWithScriptTagAndValidDates.meta,
                one_click_installation_method:
                    GorgiasChatInstallationMethod.Asset,
            },
        }

        const {result} = renderHook(() =>
            useGetOneClickInstallationStatus(invalidMethodIntegration)
        )
        expect(result.current).toBeNull()
    })

    it('should return null for invalid installation datetime', () => {
        const invalidDatesIntegration = {
            ...integration,
            meta: {
                ...integrationWithScriptTagAndValidDates.meta,
                one_click_installation_datetime: 'invalid date',
            },
        }

        const {result} = renderHook(() =>
            useGetOneClickInstallationStatus(invalidDatesIntegration)
        )
        expect(result.current).toBeNull()
    })

    it('should return "installed" if the installation date is after the uninstallation date', () => {
        const integrationWithBothDates = {
            meta: {
                ...integration.meta,
                one_click_uninstallation_datetime: moment()
                    .subtract(1, 'days')
                    .toISOString(),
            },
        } as GorgiasChatIntegration

        const {result} = renderHook(() =>
            useGetOneClickInstallationStatus(integrationWithBothDates)
        )
        expect(result.current).toBe(ONE_CLICK_INSTALLED)
    })

    it('should return null if the installation date is before the uninstallation date', () => {
        const integrationWithBothDates = {
            meta: {
                ...integration.meta,
                one_click_uninstallation_datetime: moment()
                    .add(1, 'days')
                    .toISOString(),
            },
        } as GorgiasChatIntegration

        const {result} = renderHook(() =>
            useGetOneClickInstallationStatus(integrationWithBothDates)
        )
        expect(result.current).toBeNull()
    })
})
