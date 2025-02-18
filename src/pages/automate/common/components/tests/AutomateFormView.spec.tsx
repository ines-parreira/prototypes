import {screen} from '@testing-library/react'
import React from 'react'

import {renderWithRouter} from 'utils/testing'

import {useDisplayAiAgentMovedBanner} from '../../hooks/useDisplayAiAgentMovedBanner'
import AutomateFormView from '../AutomateFormView'

jest.mock('../../hooks/useDisplayAiAgentMovedBanner', () => ({
    useDisplayAiAgentMovedBanner: jest.fn(),
}))

jest.mock('../AiAgentMovedBanner', () => ({
    AiAgentMovedBanner: () => <div>AI Agent Moved Banner</div>,
}))

describe('<AutomateFormView />', () => {
    beforeEach(() => {
        ;(useDisplayAiAgentMovedBanner as jest.Mock).mockReset()
    })

    it('should render form view with header, secondary navbar and content', () => {
        renderWithRouter(
            <AutomateFormView
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
                AutomateFormView
            </AutomateFormView>
        )

        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.getByText('Test 1')).toHaveAttribute('href', '/app/test1')
        expect(screen.getByText('Test 2')).toHaveAttribute('href', '/app/test2')
        expect(screen.getByText('AutomateFormView')).toBeInTheDocument()
    })

    it('should render full page loader if isLoading flag is set to true', () => {
        renderWithRouter(
            <AutomateFormView
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
                AutomateFormView
            </AutomateFormView>
        )

        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.queryByText('AutomateFormView')).not.toBeInTheDocument()
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render secondary navbar with candu ids', () => {
        renderWithRouter(
            <AutomateFormView
                title="Title"
                headerNavbarItems={[
                    {
                        route: '/app/test1',
                        title: 'Test 1',
                        exact: true,
                        dataCanduId: 'test1',
                    },
                    {
                        route: '/app/test2',
                        title: 'Test 2',
                        exact: true,
                        dataCanduId: 'test2',
                    },
                ]}
            >
                AutomateFormView
            </AutomateFormView>
        )

        expect(screen.getByText('Test 1')).toHaveAttribute(
            'data-candu-id',
            'test1'
        )
        expect(screen.getByText('Test 2')).toHaveAttribute(
            'data-candu-id',
            'test2'
        )
    })

    it('should render AI Agent Moved banner when useDisplayAiAgentMovedBanner returns true', () => {
        ;(useDisplayAiAgentMovedBanner as jest.Mock).mockReturnValue(true)

        renderWithRouter(
            <AutomateFormView title="Title">AutomateFormView</AutomateFormView>
        )

        expect(screen.getByText('AI Agent Moved Banner')).toBeInTheDocument()
    })

    it('should not render AI Agent Moved banner when useDisplayAiAgentMovedBanner returns false', () => {
        ;(useDisplayAiAgentMovedBanner as jest.Mock).mockReturnValue(false)

        renderWithRouter(
            <AutomateFormView title="Title">AutomateFormView</AutomateFormView>
        )

        expect(
            screen.queryByText('AI Agent Moved Banner')
        ).not.toBeInTheDocument()
    })
})
