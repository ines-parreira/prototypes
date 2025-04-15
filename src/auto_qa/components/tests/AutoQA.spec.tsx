import React from 'react'

import { render } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'

import { TicketStatus } from 'business/types/ticket'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'

import useAutoQA from '../../hooks/useAutoQA'
import AutoQA from '../AutoQA'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('../../hooks/useAutoQA', () => jest.fn())
const useAutoQAMock = useAutoQA as jest.Mock

jest.mock('hooks/useHasAgentPrivileges', () => jest.fn())
const useHasAgentPrivilegesMock = useHasAgentPrivileges as jest.Mock

jest.mock('../AutoQASkeleton', () => () => <div>Loading...</div>)
jest.mock('../Dimension', () => () => <p>Dimension</p>)

describe('AutoQA', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.SimplifyAiAgentFeedbackCollection]: false,
        })
        useHasAgentPrivilegesMock.mockReturnValue(true)
        useAppSelectorMock.mockReturnValue({ id: 1, status: TicketStatus.Open })
        useAutoQAMock.mockReturnValue({
            changeHandlers: [],
            dimensions: [],
            isLoading: false,
            lastUpdated: new Date('2024-09-17T21:00:00Z'),
        })
    })

    it('should render the component', () => {
        const { getByText } = render(<AutoQA />)
        expect(getByText('Auto QA Score')).toBeInTheDocument()
    })

    it('should render a skeleton while data is loading', () => {
        useAutoQAMock.mockReturnValue({
            changeHandlers: [jest.fn()],
            dimensions: [
                { name: 'communication_skills' },
                { name: 'resolution' },
            ],
            isLoading: true,
            lastUpdated: new Date('2024-09-17T21:00:00Z'),
        })

        const { getByText } = render(<AutoQA />)
        expect(getByText('Loading...')).toBeInTheDocument()
    })

    it('should render a message if there is no data available on open tickets', () => {
        useAutoQAMock.mockReturnValue({
            changeHandlers: [],
            dimensions: [],
            isLoading: false,
            lastUpdated: null,
        })

        const { getByText } = render(<AutoQA />)
        expect(
            getByText(
                'Auto QA results will be available 12 hours after ticket closure.',
            ),
        ).toBeInTheDocument()
    })

    it('should render a message if there is no data available on closed tickets', () => {
        useAppSelectorMock.mockReturnValue({
            id: 1,
            status: TicketStatus.Closed,
        })
        useAutoQAMock.mockReturnValue({
            changeHandlers: [],
            dimensions: [],
            isLoading: false,
            lastUpdated: null,
        })

        const { getByText } = render(<AutoQA />)
        expect(
            getByText(
                /Only tickets that meet certain requirements are scored by Auto QA./,
            ),
        ).toBeInTheDocument()
    })

    it('should render each returned dimension', () => {
        useAutoQAMock.mockReturnValue({
            changeHandlers: [jest.fn()],
            dimensions: [
                { name: 'communication_skills' },
                { name: 'resolution' },
            ],
            isLoading: false,
            lastUpdated: new Date('2024-09-17T21:00:00Z'),
        })

        const { getAllByText } = render(<AutoQA />)
        const els = getAllByText('Dimension')
        expect(els.length).toBe(2)
    })

    it('should render the last updated time', () => {
        const now = new Date()
        useAutoQAMock.mockReturnValue({
            changeHandlers: [jest.fn()],
            dimensions: [
                { name: 'communication_skills' },
                { name: 'resolution' },
            ],
            isLoading: false,
            lastUpdated: new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                21,
                0,
                0,
            ),
        })
        const { getByText } = render(<AutoQA />)
        expect(getByText('Last updated: Today at 9:00 PM')).toBeInTheDocument()
    })

    it('should render Unauthorized when SimplifyAiAgentFeedbackCollection is enabled and has no agent privileges', () => {
        mockFlags({
            [FeatureFlagKey.SimplifyAiAgentFeedbackCollection]: true,
        })
        useHasAgentPrivilegesMock.mockReturnValue(false)

        const { getByText } = render(<AutoQA />)
        expect(getByText('Unauthorized')).toBeInTheDocument()
        expect(
            getByText('You do not have permission to view ticket feedback.'),
        ).toBeInTheDocument()
    })
})
