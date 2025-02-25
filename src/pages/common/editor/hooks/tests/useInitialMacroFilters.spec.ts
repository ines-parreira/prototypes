import { renderHook } from '@testing-library/react-hooks'
import { fromJS, Map } from 'immutable'

import { getMacroParametersOptions } from 'state/macro/selectors'
import { getTicket } from 'state/ticket/selectors'

import useInitialMacroFilters from '../useInitialMacroFilters'

jest.mock('hooks/useAppSelector', () =>
    jest.fn((selector: () => unknown) => selector()),
)
jest.mock('state/macro/selectors', () => ({
    getMacroParametersOptions: jest.fn(),
}))
jest.mock('state/ticket/selectors', () => ({
    getTicket: jest.fn(),
}))

const getMacroParametersOptionsMock =
    getMacroParametersOptions as unknown as jest.Mock
const getTicketMock = getTicket as unknown as jest.Mock

describe('useMacros', () => {
    beforeEach(() => {
        jest.restoreAllMocks()

        getMacroParametersOptionsMock.mockReturnValue(Map())
        getTicketMock.mockReturnValue({})
    })

    it('should return an empty object if the ticket does not have a language', () => {
        const { result } = renderHook(() => useInitialMacroFilters())
        expect(result.current).toEqual({})
    })

    it('should return an empty object if there are no languages in macro parameters', () => {
        getTicketMock.mockReturnValue({ language: 'en' })

        const { result } = renderHook(() => useInitialMacroFilters())
        expect(result.current).toEqual({})
    })

    it('should return an empty object if the ticket language is not in the macro parameters', () => {
        getMacroParametersOptionsMock.mockReturnValue(
            fromJS({ languages: ['de', 'fr'] }),
        )
        getTicketMock.mockReturnValue({ language: 'en' })

        const { result } = renderHook(() => useInitialMacroFilters())
        expect(result.current).toEqual({})
    })

    it('should return an object with the selected language', () => {
        getMacroParametersOptionsMock.mockReturnValue(
            fromJS({ languages: ['de', 'en', 'fr'] }),
        )
        getTicketMock.mockReturnValue({ language: 'en' })

        const { result } = renderHook(() => useInitialMacroFilters())
        expect(result.current).toEqual({ languages: ['en', ''] })
    })
})
