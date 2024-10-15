import React from 'react'
import {screen} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'
import AppConfirmationModal from '../AppConfirmationModal'

const queryClient = mockQueryClient()

describe('<AppConfirmationModal />', () => {
    it('should render component', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <AppConfirmationModal
                    actionAppConfiguration={{app_id: '1', type: 'app'}}
                    isOpen={true}
                    onConfirm={jest.fn()}
                    setOpen={jest.fn()}
                    templateId="1"
                    templateName="test template"
                />
            </QueryClientProvider>
        )

        expect(screen.getByText('test template')).toBeInTheDocument()
    })
})
