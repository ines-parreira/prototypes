import { toDuration } from '../utils'

describe('toDuration', () => {
    it.each([
        [0.9700122399020801, null],
        [null, 0.9700122399020801],
        [0.9700122399020801, 0.9700122399020801],
        [0, 0],
        [null, null],
    ])(
        'Should return 0h 0m when value=%s and prevValue=%s',
        (value, prevValue) => {
            expect(
                toDuration({
                    isFetching: false,
                    isError: false,
                    data: {
                        value,
                        prevValue,
                    },
                }),
            ).toEqual('0h 0m')
        },
    )
    it.each([[1, null]])(
        'Should return 1s when value=%s and prevValue=%s',
        (value, prevValue) => {
            expect(
                toDuration({
                    isFetching: false,
                    isError: false,
                    data: {
                        value,
                        prevValue,
                    },
                }),
            ).toEqual('1s')
        },
    )
    it.each([[60, null]])(
        'Should return 1m when value=%s and prevValue=%s',
        (value, prevValue) => {
            expect(
                toDuration({
                    isFetching: false,
                    isError: false,
                    data: {
                        value,
                        prevValue,
                    },
                }),
            ).toEqual('1m')
        },
    )
})
