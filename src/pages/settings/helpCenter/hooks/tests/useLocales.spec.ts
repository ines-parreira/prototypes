import {waitFor} from '@testing-library/react'
import {renderHook} from 'react-hooks-testing-library'

import {useHelpCenterApi} from '../useHelpCenterApi'
import {useLocales} from '../useLocales'

jest.mock('../useHelpCenterApi', () => {
    return {
        useHelpCenterApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                listLocales: jest.fn().mockReturnValue(
                    Promise.resolve({
                        data: [
                            {
                                name: 'English - USA',
                                code: 'en-US',
                            },
                            {
                                name: 'French - France',
                                code: 'fr-FR',
                            },
                            {
                                name: 'French - Canada',
                                code: 'fr-CA',
                            },
                            {
                                name: 'Czech - Czech Republic',
                                code: 'cs-CZ',
                            },
                        ],
                    })
                ),
            },
        }),
    }
})

describe('useLocales()', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns the payload once it is fetched', async () => {
        const {result} = renderHook(useLocales)

        expect(result.current).toEqual([])

        await waitFor(() =>
            expect(result.current).toEqual([
                {
                    name: 'English - USA',
                    code: 'en-US',
                },
                {
                    name: 'French - France',
                    code: 'fr-FR',
                },
                {
                    name: 'French - Canada',
                    code: 'fr-CA',
                },
                {
                    name: 'Czech - Czech Republic',
                    code: 'cs-CZ',
                },
            ])
        )
    })

    it('only fetches the locales if we do not have them saved', () => {
        const {result} = renderHook(useLocales)

        expect(result.current.length).toBeGreaterThan(0)
        expect(useHelpCenterApi().client?.listLocales).toHaveBeenCalledTimes(0)
    })
})
