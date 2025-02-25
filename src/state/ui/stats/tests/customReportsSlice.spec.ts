import { AnalyticsCustomReport } from 'models/stat/types'
import {
    createCustomReport,
    customReportsSlice,
    CustomReportsSliceState,
    duplicateCustomReport,
    removeCustomReport,
    updateCustomReport,
} from 'state/ui/stats/customReportsSlice'

describe('customReportsSlice', () => {
    const initialState: CustomReportsSliceState = {
        customReports: null,
    }

    const sampleCustomReport: AnalyticsCustomReport = {
        analytics_filter_id: 1,
        emoji: null,
        children: [],
        id: 1,
        name: 'Sample Report',
        type: 'custom_report',
    }

    describe('createCustomReport', () => {
        it('should add a new custom report to the state', () => {
            const newState = customReportsSlice.reducer(
                initialState,
                createCustomReport(sampleCustomReport),
            )
            expect(newState.customReports).toEqual(sampleCustomReport)
        })
    })

    describe('updateCustomReport', () => {
        it('should update an existing custom report', () => {
            const updatedReport = {
                ...sampleCustomReport,
                name: 'Updated Report',
            }
            const stateWithReport: CustomReportsSliceState = {
                customReports: sampleCustomReport,
            }
            const newState = customReportsSlice.reducer(
                stateWithReport,
                updateCustomReport({ id: 1, updatedReport }),
            )
            expect(newState.customReports).toEqual(updatedReport)
        })

        it('should not update if the report does not exist', () => {
            const updatedReport = {
                ...sampleCustomReport,
                name: 'Updated Report',
            }
            const newState = customReportsSlice.reducer(
                initialState,
                updateCustomReport({ id: 2, updatedReport }),
            )
            expect(newState.customReports).toEqual(null)
        })
    })

    describe('duplicateCustomReport', () => {
        it('should duplicate an existing custom report', () => {
            const stateWithReport: CustomReportsSliceState = {
                customReports: sampleCustomReport,
            }
            const newState = customReportsSlice.reducer(
                stateWithReport,
                duplicateCustomReport(1),
            )
            expect(newState.customReports?.id).toEqual(2)
        })

        it('should not duplicate if the report does not exist', () => {
            const newState = customReportsSlice.reducer(
                initialState,
                duplicateCustomReport(2),
            )
            expect(newState.customReports).toEqual(null)
        })
    })

    describe('removeCustomReport', () => {
        it('should remove an existing custom report', () => {
            const stateWithReport: CustomReportsSliceState = {
                customReports: sampleCustomReport,
            }
            const newState = customReportsSlice.reducer(
                stateWithReport,
                removeCustomReport(1),
            )
            expect(newState.customReports).toEqual(null)
        })

        it('should not remove if the report does not exist', () => {
            const newState = customReportsSlice.reducer(
                initialState,
                removeCustomReport(2),
            )
            expect(newState.customReports).toEqual(null)
        })
    })
})
