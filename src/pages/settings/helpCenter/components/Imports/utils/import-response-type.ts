import {Components} from '../../../../../../../../../rest_api/help_center_api/client.generated'

export type AnyProcessCsvResponse =
    | Components.Schemas.ProcessCsvResponseSuccessDto
    | Components.Schemas.ProcessCsvResponseFailedDto
    | Components.Schemas.ProcessCsvResponsePartialDto

export const importSuccessful = (
    report: AnyProcessCsvResponse
): report is Components.Schemas.ProcessCsvResponseSuccessDto =>
    report.status === 'SUCCESS'

export const importFailed = (
    report: AnyProcessCsvResponse
): report is Components.Schemas.ProcessCsvResponseFailedDto =>
    report.status === 'FAILED'

export const importPartial = (
    report: AnyProcessCsvResponse
): report is Components.Schemas.ProcessCsvResponsePartialDto =>
    report.status === 'PARTIAL'
