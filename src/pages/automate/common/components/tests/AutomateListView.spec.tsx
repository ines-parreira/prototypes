import {screen} from '@testing-library/react'
import React from 'react'

import {renderWithRouter} from 'utils/testing'

import AutomateListView from '../AutomateListView'

describe('<AutomateListView />', () => {
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
})
