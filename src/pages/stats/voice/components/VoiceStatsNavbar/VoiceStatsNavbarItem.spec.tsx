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

    it('should render with NEW badge', () => {
        mockUseAppSelector.mockReturnValue(true)
        const {getByText} = renderWithRouter(
            <VoiceStatsNavbarItem {...defaultProps} isNew />
        )
        expect(getByText(defaultProps.title)).toBeInTheDocument()
        expect(getByText('NEW')).toBeInTheDocument()
    })

    it('should render without badge', () => {
        mockUseAppSelector.mockReturnValue(true)
        const {queryByText} = renderWithRouter(
            <VoiceStatsNavbarItem {...defaultProps} />
        )
        expect(queryByText('NEW')).not.toBeInTheDocument()
        expect(queryByText('arrow_circle_up')).not.toBeInTheDocument()
    })
})
