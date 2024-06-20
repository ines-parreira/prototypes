import {AxiosError, AxiosHeaders, AxiosResponse} from 'axios'
import {axiosSuccessResponse} from '../../../../../../../fixtures/axiosResponse'
import {
    emptyMigrationStats,
    migrationStatsWithFailures,
    migrationStatsWithoutFailures,
    succeededMigrationStats,
} from './fixtures/migration-sessions'
import {getErrorMessage, parseSessionStats} from './utils'
import {DetailMessage, ErrorResponse, UnprocessableContent} from './types'

describe('utils', () => {
    describe('parseSessionStats', () => {
        test('should match snapshots', () => {
            expect(
                parseSessionStats({stats: emptyMigrationStats})
            ).toMatchSnapshot()
            expect(
                parseSessionStats({stats: succeededMigrationStats})
            ).toMatchSnapshot()
            expect(
                parseSessionStats({stats: migrationStatsWithFailures})
            ).toMatchSnapshot()
            expect(
                parseSessionStats({stats: migrationStatsWithoutFailures})
            ).toMatchSnapshot()
        })
    })

    describe('getErrorMessage', () => {
        const baseResponse: AxiosResponse = axiosSuccessResponse({})

        const baseAxiosError: AxiosError = {
            isAxiosError: true,
            response: baseResponse,
            config: {headers: new AxiosHeaders()},
            name: 'someName',
            message: 'someMessage',
            toJSON: jest.fn(),
        }

        const axiosErrorWithData = (data: ErrorResponse): AxiosError => ({
            ...baseAxiosError,
            response: {...baseResponse, data},
        })

        it.each([
            new Error('non axios error'),
            {...baseAxiosError, response: undefined},
            axiosErrorWithData({} as ErrorResponse),
        ])('to be undefined', (error) =>
            expect(getErrorMessage(error)).toBeUndefined()
        )

        it.each([
            axiosErrorWithData([
                {msg: 'something bad happened'},
            ] as UnprocessableContent),
            axiosErrorWithData({
                message: 'something else bad happened',
            } as DetailMessage),
        ])('should match snapshots', (error) =>
            expect(getErrorMessage(error)).toMatchSnapshot()
        )
    })
})
