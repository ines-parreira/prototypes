import React from 'react'

import {assumeMock, renderWithRouter} from 'utils/testing'
import useAppSelector from 'hooks/useAppSelector'
import VoiceStatsNavbarItem from './VoiceStatsNavbarItem'

jest.mock('hooks/useAppSelector', () => jest.fn())
const mockUseAppSelector = assumeMock(useAppSelector)

describe('<VoiceStatsNavbarItem />', () => {
    const defaultProps = {
        to: 'example.com',
        title: 'Test',
        commonNavLinkProps: {
            exact: true,
        },
    }

    it('should render with upgrade icon', () => {
        mockUseAppSelector.mockReturnValue(false)
        const {getByText} = renderWithRouter(
            <VoiceStatsNavbarItem {...defaultProps} />
        )
        expect(getByText(defaultProps.title)).toBeInTheDocument()
        expect(getByText('arrow_circle_up')).toBeInTheDocument()
    })
})
