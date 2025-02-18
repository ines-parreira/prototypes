import {screen} from '@testing-library/react'
import React from 'react'

import {renderWithRouter} from 'utils/testing'

import {useDisplayAiAgentMovedBanner} from '../../hooks/useDisplayAiAgentMovedBanner'
import AutomateListView from '../AutomateListView'

jest.mock('../../hooks/useDisplayAiAgentMovedBanner', () => ({
    useDisplayAiAgentMovedBanner: jest.fn(),
}))

jest.mock('../AiAgentMovedBanner', () => ({
    AiAgentMovedBanner: () => <div>AI Agent Moved Banner</div>,
}))

describe('<AutomateListView />', () => {
    beforeEach(() => {
        ;(useDisplayAiAgentMovedBanner as jest.Mock).mockReset()
    })

    it('should render list view with header, secondary navbar and content', () => {
        renderWithRouter(
            <AutomateListView
                title="Title"
                headerNavbarItems={[
                    {
                        route: '/app/test1',
                        title: 'Test 1',
                        exact: true,
                    },
                    {
                        route: '/app/test2',
                        title: 'Test 2',
                        exact: true,
                    },
                ]}
            >
                AutomateListView
            </AutomateListView>
        )

        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.getByText('Test 1')).toHaveAttribute('href', '/app/test1')
        expect(screen.getByText('Test 2')).toHaveAttribute('href', '/app/test2')
        expect(screen.getByText('AutomateListView')).toBeInTheDocument()
    })

    it('should render full page loader if isLoading flag is set to true', () => {
        renderWithRouter(
            <AutomateListView
                title="Title"
                headerNavbarItems={[
                    {
                        route: '/app/test1',
                        title: 'Test 1',
                        exact: true,
                    },
                    {
                        route: '/app/test2',
                        title: 'Test 2',
                        exact: true,
                    },
                ]}
                isLoading
            >
                AutomateListView
            </AutomateListView>
        )

        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.queryByText('AutomateListView')).not.toBeInTheDocument()
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render AI Agent Moved banner when useDisplayAiAgentMovedBanner returns true', () => {
        ;(useDisplayAiAgentMovedBanner as jest.Mock).mockReturnValue(true)

        renderWithRouter(
            <AutomateListView title="Title">AutomateListView</AutomateListView>
        )

        expect(screen.getByText('AI Agent Moved Banner')).toBeInTheDocument()
    })

    it('should not render AI Agent Moved banner when useDisplayAiAgentMovedBanner returns false', () => {
        ;(useDisplayAiAgentMovedBanner as jest.Mock).mockReturnValue(false)

        renderWithRouter(
            <AutomateListView title="Title">AutomateListView</AutomateListView>
        )

        expect(
            screen.queryByText('AI Agent Moved Banner')
        ).not.toBeInTheDocument()
    })
})
