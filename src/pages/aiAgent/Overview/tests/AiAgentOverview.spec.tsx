import {QueryClientProvider} from '@tanstack/react-query'
import {render} from '@testing-library/react'

import React from 'react'
import {useLocation} from 'react-router-dom'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {AiAgentOverview} from '../AiAgentOverview'

jest.mock('react-router')

const defaultLocation = {
    pathname: '',
    search: '',
    state: '',
    hash: '',
}

const useLocationMock = assumeMock(useLocation)
useLocationMock.mockReturnValue(defaultLocation)

const queryClient = mockQueryClient()

const renderComponent = () => {
    return render(
        <QueryClientProvider client={queryClient}>
            <AiAgentOverview />
        </QueryClientProvider>
    )
}

describe('useAiAgentOverview', () => {
    it('should render', () => {
        const {queryByText} = renderComponent()

        expect(queryByText(/Welcome,.*/)).toBeTruthy()
        expect(queryByText('AI Agent Performance')).toBeTruthy()
        expect(queryByText('Complete AI Agent Setup')).toBeTruthy()
        expect(queryByText('Resources')).toBeTruthy()
    })

    it('should not renders the Thank You modal', () => {
        const {queryByText} = renderComponent()
        expect(queryByText('Your account is ready')).toBeNull()
    })

    describe('when coming from onboarding', () => {
        it('should renders the Thank You modal', async () => {
            useLocationMock.mockReturnValue({
                ...defaultLocation,
                state: {from: '/app/ai-agent/onboarding'},
            })

            const {findByText} = renderComponent()

            expect(await findByText('Your account is ready!')).toBeVisible()
        })
    })

    describe('when coming from another page', () => {
        it('should renders the Thank You modal', () => {
            useLocationMock.mockReturnValue({
                ...defaultLocation,
                state: {from: '/app/ai-agent/test'},
            })

            const {queryByText} = renderComponent()

            expect(queryByText('Your account is ready')).toBeNull()
        })
    })
})
