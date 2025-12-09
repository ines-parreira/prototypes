import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'

export const DATE_FORMAT = DateTimeFormatMapper[
    DateTimeFormatType.SHORT_DATE_EN_US
] as string
