import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { actionFixture } from 'fixtures/infobarCustomActions'
import { ContentType } from 'models/api/types'

import ActionEditor from '../ActionEditor'

describe('<ActionEditor/>', () => {
    const action = actionFixture()

    const props = {
        onSubmit: jest.fn(),
        onClose: jest.fn(),
        action,
    }

    beforeEach(() => {
        props.action = actionFixture()
        props.action.headers = [
            {
                key: 'somekey0',
                value: 'somevalue',
                label: 'should not display',
                editable: false,
                mandatory: false,
            },
            {
                key: 'somekey1',
                value: 'somevalue1',
                label: 'textLabel',
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
                value: 'dropdownValue1;dropdownValue2',
                label: 'dropdownLabel',
                editable: true,
                mandatory: false,
            },
        ]
    })

    it('should render with correct labels', () => {
        render(<ActionEditor {...props} />)

        expect(
            screen.queryByLabelText(
                new RegExp(props.action.headers[1].label || ''),
            ),
        ).toBeTruthy()
        expect(screen.queryByLabelText(props.action.headers[1].key)).toBeFalsy()
        expect(
            screen.queryByLabelText(new RegExp(props.action.params[0].key)),
        ).toBeTruthy()
        expect(
            screen.queryByLabelText(
                props.action.body[ContentType.Form][0].label || '',
            ),
        ).toBeTruthy()
    })

    it('should call on close when clicking the close button', async () => {
        const user = userEvent.setup()
        render(<ActionEditor {...props} />)
        await act(() => user.click(screen.getByText('Cancel')))
        expect(props.onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onSubmit with proper params when clicking the execute button and then onClose', async () => {
        const user = userEvent.setup()
        const newValue = 'edited'
        render(<ActionEditor {...props} />)

        await act(async () => {
            const textLabel = screen.getByLabelText(/textLabel/)
            await user.clear(textLabel)
            await user.type(textLabel, newValue)
        })

        await act(async () => {
            const dropdownLabel = screen.getByLabelText(/dropdownLabel/)
            await user.clear(dropdownLabel)
            await user.type(dropdownLabel, 'dropdownValue2')
        })

        await act(() => user.click(screen.getByText('Execute')))

        expect(props.onSubmit).toHaveBeenCalledWith({
            ...props.action,
            headers: [
                props.action.headers[0],
                { ...props.action.headers[1], value: newValue },
            ],
            body: {
                ...props.action.body,
                [ContentType.Form]: [
                    {
                        ...props.action.body[ContentType.Form][0],
                        value: 'dropdownValue2',
                    },
                ],
            },
        })
        expect(props.onClose).toHaveBeenCalledTimes(1)
    })
})
