import React from 'react'
import {render, screen, within, act, fireEvent} from '@testing-library/react'

import {ActionTemplate} from '../../types'
import ActionsPlatformTemplatesTable from '../ActionsPlatformTemplatesTable'

jest.mock(
    '../ActionsPlatformTemplatesTableRow',
    () =>
        ({template}: {template: Pick<ActionTemplate, 'name'>}) =>
            (
                <tr>
                    <td>{template.name}</td>
                    <td></td>
                </tr>
            )
)

describe('<ActionsPlatformTemplatesTable />', () => {
    it('should render templates table', () => {
        render(
            <ActionsPlatformTemplatesTable
                templates={[
                    {
                        id: '1',
                        name: 'test1',
                        apps: [{type: 'shopify'}],
                        updated_datetime: '2024-08-02T08:18:51.611Z',
                    },
                    {
                        id: '2',
                        name: 'test2',
                        apps: [{type: 'shopify'}],
                        updated_datetime: '2024-08-01T08:18:51.611Z',
                    },
                ]}
                getAppFromTemplateApp={jest.fn()}
            />
        )

        expect(screen.getAllByRole('row')).toHaveLength(3)
        expect(screen.getByText('test1')).toBeInTheDocument()
        expect(screen.getByText('test2')).toBeInTheDocument()
    })

    it('should allow to order templates by updated datetime', () => {
        render(
            <ActionsPlatformTemplatesTable
                templates={[
                    {
                        id: '1',
                        name: 'test1',
                        apps: [{type: 'shopify'}],
                        updated_datetime: '2024-08-02T08:18:51.611Z',
                    },
                    {
                        id: '2',
                        name: 'test2',
                        apps: [{type: 'shopify'}],
                        updated_datetime: '2024-08-01T08:18:51.611Z',
                    },
                ]}
                getAppFromTemplateApp={jest.fn()}
            />
        )

        expect(
            within(screen.getAllByRole('row')[1]).getByText('test1')
        ).toBeInTheDocument()
        expect(
            within(screen.getAllByRole('row')[2]).getByText('test2')
        ).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('LAST UPDATED'))
        })

        expect(
            within(screen.getAllByRole('row')[1]).getByText('test2')
        ).toBeInTheDocument()
        expect(
            within(screen.getAllByRole('row')[2]).getByText('test1')
        ).toBeInTheDocument()
    })
})
