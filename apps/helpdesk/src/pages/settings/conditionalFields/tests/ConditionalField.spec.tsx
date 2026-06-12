import React from 'react'

import { assumeMock, render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { Link, useParams } from 'react-router-dom'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockGetCustomFieldConditionHandler,
    mockGetCustomFieldConditionResponse,
} from '@gorgias/helpdesk-mocks'

import { Loader } from 'pages/common/components/Loader/Loader'
import { CUSTOM_FIELD_CONDITIONS_ROUTE } from 'routes/constants'

import { EditConditionForm as ConditionForm } from '../components/ConditionForm'
import { ConditionalField } from '../ConditionalField'

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            Link: jest.fn(() => <></>),
            useParams: jest.fn(() => ({ id: 10 })),
        }) as Record<string, unknown>,
)
jest.mock('pages/common/components/Loader/Loader')
jest.mock('../components/ConditionForm', () => ({
    EditConditionForm: jest.fn(() => <div>ConditionForm</div>),
}))

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('ConditionalField', () => {
    const conditionData = { name: 'Condition 10' }
    beforeEach(() => {
        jest.clearAllMocks()
        assumeMock(useParams).mockReturnValue({ id: '10' })
        assumeMock(Loader).mockReturnValue(<div>Loading...</div>)
        server.use(
            mockGetCustomFieldConditionHandler(async () =>
                HttpResponse.json(
                    mockGetCustomFieldConditionResponse(conditionData),
                ),
            ).handler,
        )
    })

    it('should set the appropriate page title', async () => {
        const { rerender } = render(<ConditionalField />)

        expect(await screen.findByText(conditionData.name)).toBeInTheDocument()
        expect(document.title).toEqual(conditionData.name)

        assumeMock(useParams).mockReturnValue({ id: 'add' })

        rerender(<ConditionalField />)

        expect(document.title).toEqual('Create condition')
        expect(screen.getByText('Create condition')).toBeInTheDocument()
    })

    it('should render a link to Field Conditions', async () => {
        render(<ConditionalField />)

        await waitFor(() => {
            expect(Link).toHaveBeenCalledWith(
                {
                    to: `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}/`,
                    children: 'Field Conditions',
                },
                {},
            )
        })
    })

    it('should show a loader when condition is loading', () => {
        server.use(
            mockGetCustomFieldConditionHandler(
                async () => new Promise(() => undefined),
            ).handler,
        )

        render(<ConditionalField />)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it("should call ConditionForm with condition's data", async () => {
        render(<ConditionalField />)

        await waitFor(() => {
            expect(ConditionForm).toHaveBeenCalledWith(
                { condition: expect.objectContaining(conditionData) },
                {},
            )
        })
    })
})
