import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'

import {ContentType} from '../../../../../../../../../../../../models/api/types'
import {actionFixture} from '../../../../../../../../../../../../fixtures/infobarCustomActions'

import ActionEditor from '../ActionEditor'

describe('<ActionEditor/>', () => {
    const action = actionFixture()

    const props = {
        onSubmit: jest.fn(),
        onClose: jest.fn(),
        action,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        props.action = actionFixture()
        props.action.headers = [
            {
                key: 'somekey',
                value: 'somevalue',
                label: 'should not display',
                editable: false,
                mandatory: false,
            },
            {
                key: 'somekey1',
                value: 'somevalue1',
                label: 'ok1',
                editable: true,
                mandatory: true,
            },
        ]
        props.action.params = [
            {
                key: 'somekey2',
                value: 'somevalue2',
                label: '',
                editable: true,
                mandatory: true,
            },
        ]
        props.action.body[ContentType.Form] = [
            {
                key: 'somekey3',
                value: 'somevalue3',
                label: '',
                editable: true,
                mandatory: false,
            },
        ]
    })

    it('should render with correct labels', () => {
        const {container} = render(<ActionEditor {...props} />)

        expect(container).toMatchSnapshot()
        expect(screen.queryByText(props.action.headers[1].label)).toBeTruthy()
        expect(screen.queryByText(props.action.headers[1].key)).toBeFalsy()
        expect(screen.queryByText(props.action.params[0].key)).toBeTruthy()
        expect(
            screen.getByText(props.action.body[ContentType.Form][0].key)
        ).toBeTruthy()
    })

    it('should call on close when clicking the close button', () => {
        render(<ActionEditor {...props} />)
        fireEvent.click(screen.getByText('Cancel'))
        expect(props.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onSubmit with proper params when clicking the execute button and then onClose', () => {
        const newValue = 'edited'
        render(<ActionEditor {...props} />)
        fireEvent.change(screen.getByLabelText('ok1'), {
            target: {value: newValue},
        })
        fireEvent.click(screen.getByText('Execute'))
        props.action.headers[1].value = newValue
        expect(props.onSubmit).toHaveBeenCalledWith(props.action)
        expect(props.onClose).toHaveBeenCalledTimes(1)
    })
})
