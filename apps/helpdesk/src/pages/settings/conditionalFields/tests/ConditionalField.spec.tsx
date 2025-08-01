import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Link, useParams } from 'react-router-dom'

import { useGetCustomFieldCondition } from '@gorgias/helpdesk-queries'

import Loader from 'pages/common/components/Loader/Loader'
import { CUSTOM_FIELD_CONDITIONS_ROUTE } from 'routes/constants'

import ConditionForm from '../components/ConditionForm'
import ConditionalField from '../ConditionalField'

jest.mock('@gorgias/helpdesk-queries')
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
jest.mock('../components/ConditionForm', () =>
    jest.fn(() => <div>ConditionForm</div>),
)

const useGetCustomFieldConditionMock = assumeMock(useGetCustomFieldCondition)

describe('ConditionalField', () => {
    const conditionData = { name: 'Condition 10' }
    beforeEach(() => {
        assumeMock(useParams).mockReturnValue({ id: '10' })
        assumeMock(Loader).mockReturnValue(<div>Loading...</div>)
        useGetCustomFieldConditionMock.mockReturnValue({
            data: conditionData,
            isLoading: false,
        } as ReturnType<typeof useGetCustomFieldCondition>)
    })

    it('should set the appropriate page title', () => {
        const { rerender } = render(<ConditionalField />)

        expect(document.title).toEqual(conditionData.name)
        expect(screen.getByText(conditionData.name)).toBeInTheDocument()

        assumeMock(useParams).mockReturnValue({ id: 'add' })

        rerender(<ConditionalField />)

        expect(document.title).toEqual('Create condition')
        expect(screen.getByText('Create condition')).toBeInTheDocument()
    })

    it('should render a link to Field Conditions', () => {
        render(<ConditionalField />)

        expect(Link).toHaveBeenCalledWith(
            {
                to: `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}/`,
                children: 'Field Conditions',
            },
            {},
        )
    })

    it('should show a loader when condition is loading', () => {
        useGetCustomFieldConditionMock.mockReturnValue({
            data: conditionData,
            isLoading: true,
        } as unknown as ReturnType<typeof useGetCustomFieldCondition>)

        render(<ConditionalField />)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it("should call ConditionForm with condition's data", () => {
        render(<ConditionalField />)

        expect(ConditionForm).toHaveBeenCalledWith(
            { condition: conditionData },
            {},
        )
    })
})
