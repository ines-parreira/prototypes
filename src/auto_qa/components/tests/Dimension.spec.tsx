import {TicketQAScoreDimension} from '@gorgias/api-queries'
import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import {dimensionConfig} from '../../config'

import Dimension from '../Dimension'

describe('Dimension', () => {
    const defaultDimension = {
        id: 2,
        ticket_id: 1,
        user_id: null,
        created_datetime: '2024-01-20T10:00:00Z',
        updated_datetime: '2024-01-21T10:00:00Z',
        name: 'communication_skills',
        prediction: 5,
        explanation: 'Beepity-boopity',
    } as TicketQAScoreDimension

    beforeEach(() => {})

    it('should render the component', () => {
        const onChange = jest.fn()
        const {getByText, queryByText} = render(
            <Dimension
                config={dimensionConfig.communication_skills}
                dimension={defaultDimension}
                onChange={onChange}
            />
        )
        expect(getByText('Communication')).toBeInTheDocument()
        expect(getByText('5/5')).toBeInTheDocument()
        expect(queryByText('Beepity-boopity')).not.toBeInTheDocument()
    })

    it('should automatically expand if the prediction is below the configured threshold', () => {
        const onChange = jest.fn()
        const {getByText} = render(
            <Dimension
                config={dimensionConfig.communication_skills}
                dimension={{...defaultDimension, prediction: 4}}
                onChange={onChange}
            />
        )
        expect(getByText('Beepity-boopity')).toBeInTheDocument()
    })

    it('should call onChange when the prediction changes', () => {
        const onChange = jest.fn()
        const {getByRole, getByText} = render(
            <Dimension
                config={dimensionConfig.communication_skills}
                dimension={defaultDimension}
                onChange={onChange}
            />
        )

        const el = getByRole('combobox')
        fireEvent.focus(el)
        fireEvent.click(getByText('4/5'))
        expect(onChange).toHaveBeenCalledWith(4, 'Beepity-boopity')
    })

    it('should call onChange when the explanation changes', () => {
        const onChange = jest.fn()
        const {getByText} = render(
            <Dimension
                config={dimensionConfig.communication_skills}
                dimension={defaultDimension}
                onChange={onChange}
            />
        )

        fireEvent.click(getByText('arrow_right'))
        fireEvent.change(getByText('Beepity-boopity'), {target: {value: 'Yup'}})
        expect(onChange).toHaveBeenCalledWith(5, 'Yup')
    })
})
