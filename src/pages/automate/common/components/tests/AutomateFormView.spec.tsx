import {screen} from '@testing-library/react'
import React from 'react'

import {renderWithRouter} from 'utils/testing'

import AutomateFormView from '../AutomateFormView'

describe('<AutomateFormView />', () => {
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
})
