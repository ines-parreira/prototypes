import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockCreateCustomFieldConditionHandler,
    mockDeleteCustomFieldConditionHandler,
    mockUpdateCustomFieldConditionHandler,
} from '@gorgias/helpdesk-mocks'

import { customFieldCondition } from 'fixtures/customFieldCondition'

import { ConditionalFieldRow } from '../ConditionalFieldRow'

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

const baseProps = {
    position: 0,
    onMoveEntity: jest.fn(),
    onDropEntity: jest.fn(),
}

describe('<CustomFieldRow />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        server.use(
            mockCreateCustomFieldConditionHandler(async () =>
                HttpResponse.json({ ...customFieldCondition, id: 123 }),
            ).handler,
            mockUpdateCustomFieldConditionHandler(async () =>
                HttpResponse.json(customFieldCondition),
            ).handler,
            mockDeleteCustomFieldConditionHandler().handler,
        )
    })

    it('should render', () => {
        render(
            <ConditionalFieldRow
                {...baseProps}
                condition={customFieldCondition}
            />,
            {
                dndBackend: HTML5Backend,
            },
        )
        expect(screen.getByText(customFieldCondition.name)).toBeDefined()
    })

    it('should create a new condition when clicking the duplicate button', async () => {
        const createConditionMock = mockCreateCustomFieldConditionHandler(
            async () => HttpResponse.json({ ...customFieldCondition, id: 123 }),
        )
        server.use(createConditionMock.handler)
        const waitForCreateConditionRequest =
            createConditionMock.waitForRequest(server)

        render(
            <ConditionalFieldRow
                {...baseProps}
                condition={customFieldCondition}
                canDuplicate
            />,
            {
                dndBackend: HTML5Backend,
            },
        )
        fireEvent.click(screen.getByTitle('Duplicate Condition'))

        await waitForCreateConditionRequest(async (request) => {
            expect(await request.json()).toEqual(
                expect.objectContaining({
                    name: `(Copy) ${customFieldCondition.name}`,
                    object_type: customFieldCondition.object_type,
                    sort_order: customFieldCondition.sort_order,
                    deactivated_datetime: null,
                }),
            )
        })
    })

    it('should delete the condition with confirmation when clicking the delete button', async () => {
        const deleteConditionMock = mockDeleteCustomFieldConditionHandler()
        server.use(deleteConditionMock.handler)
        const waitForDeleteConditionRequest =
            deleteConditionMock.waitForRequest(server)

        render(
            <ConditionalFieldRow
                {...baseProps}
                condition={customFieldCondition}
            />,
            {
                dndBackend: HTML5Backend,
            },
        )
        fireEvent.click(screen.getByTitle('Delete Condition'))
        fireEvent.click(screen.getByText(/Confirm/))

        await waitForDeleteConditionRequest((request) => {
            expect(request.url).toContain(
                `/api/custom-field-conditions/${customFieldCondition.id}`,
            )
        })
    })

    it('should enable the condition without confirmation when clicking the ON toggle', async () => {
        const updateConditionMock = mockUpdateCustomFieldConditionHandler(
            async () => HttpResponse.json(customFieldCondition),
        )
        server.use(updateConditionMock.handler)
        const waitForUpdateConditionRequest =
            updateConditionMock.waitForRequest(server)
        const deactivatedCondition = {
            ...customFieldCondition,
            deactivated_datetime: '2024-07-29T09:09:41.626092+00:00',
        }
        render(
            <ConditionalFieldRow
                {...baseProps}
                condition={deactivatedCondition}
            />,
            {
                dndBackend: HTML5Backend,
            },
        )
        fireEvent.click(screen.getByRole('switch'))

        await waitForUpdateConditionRequest(async (request) => {
            expect(request.url).toContain(
                `/api/custom-field-conditions/${deactivatedCondition.id}`,
            )
            expect(await request.json()).toEqual({
                deactivated_datetime: null,
            })
        })
    })

    it('should disable the condition with confirmation when clicking the OFF toggle', async () => {
        const updateConditionMock = mockUpdateCustomFieldConditionHandler(
            async () => HttpResponse.json(customFieldCondition),
        )
        server.use(updateConditionMock.handler)
        const waitForUpdateConditionRequest =
            updateConditionMock.waitForRequest(server)

        render(
            <ConditionalFieldRow
                {...baseProps}
                condition={customFieldCondition}
            />,
            {
                dndBackend: HTML5Backend,
            },
        )
        fireEvent.click(screen.getByRole('switch'))
        fireEvent.click(screen.getByText(/Confirm/))

        await waitForUpdateConditionRequest(async (request) => {
            expect(request.url).toContain(
                `/api/custom-field-conditions/${customFieldCondition.id}`,
            )
            expect(await request.json()).toEqual({
                deactivated_datetime: expect.any(String),
            })
        })
    })
})
