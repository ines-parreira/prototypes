import React from 'react'
import {fireEvent} from '@testing-library/react'

import {assumeMock, renderWithRouter} from 'utils/testing'
import useAppSelector from 'hooks/useAppSelector'
import {VOICE_LEARN_MORE_URL} from 'pages/stats/voice/constants/voiceOverview'
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

    it('should render with NEW badge', () => {
        mockUseAppSelector.mockReturnValue(true)
        const {getByText} = renderWithRouter(
            <VoiceStatsNavbarItem {...defaultProps} />
        )
        expect(getByText(defaultProps.title)).toBeInTheDocument()
        expect(getByText('NEW')).toBeInTheDocument()
    })

    it('should render with upgrade icon', () => {
        mockUseAppSelector.mockReturnValue(false)
        const {getByText} = renderWithRouter(
            <VoiceStatsNavbarItem {...defaultProps} />
        )
        expect(getByText(defaultProps.title)).toBeInTheDocument()
        expect(getByText('arrow_circle_up')).toBeInTheDocument()
    })

    it('should render custom tooltip on hover', () => {
        mockUseAppSelector.mockReturnValue(false)
        const {getByText} = renderWithRouter(
            <VoiceStatsNavbarItem {...defaultProps} />
        )
        fireEvent.mouseOver(getByText('arrow_circle_up'))
        expect(getByText('Learn more')).toBeInTheDocument()
        fireEvent.click(getByText('Learn more'))
        expect(window.open).toHaveBeenCalledWith(
            VOICE_LEARN_MORE_URL,
            '_blank',
            'noopener'
        )
    })
})
