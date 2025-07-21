import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { assumeMock } from 'utils/testing'

import ImpersonationBanner from '../ImpersonationBanner'

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const useAppSelectorMock = assumeMock(useAppSelector)
const useFlagMock = assumeMock(useFlag)

describe('ImpersonatedBanner', () => {
    beforeEach(() => {
        window.USER_IMPERSONATED = null
        useFlagMock.mockReturnValue(false)
    })

    it('should render banner content', () => {
        window.USER_IMPERSONATED = true
        window.GORGIAS_CLUSTER = 'cluster'
        useAppSelectorMock.mockReturnValue(
            fromJS({
                id: '1',
                email: 'heya',
            }),
        )

        const { queryByText } = render(<ImpersonationBanner />)
        expect(queryByText('heya')).toBeTruthy()
    })

    it('should not render when USER_IMPERSONATED is false', () => {
        window.GORGIAS_CLUSTER = 'cluster'
        useAppSelectorMock.mockReturnValue(
            fromJS({
                id: '1',
                email: 'heya',
            }),
        )

        const { queryByText } = render(<ImpersonationBanner />)
        expect(queryByText('heya')).toBeFalsy()
    })
})
