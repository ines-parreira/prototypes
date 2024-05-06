import React from 'react'
import {render, act, fireEvent} from '@testing-library/react'

import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {createTrigger} from 'pages/convert/campaigns/utils/createTrigger'

import {CurrentUrlTrigger} from '../CurrentUrlTrigger'

describe('<CurrentUrlTrigger>', () => {
    it('should render correctly', () => {
        const trigger = createTrigger(CampaignTriggerType.CurrentUrl)

        const {getByTestId, getByText} = render(
            <CurrentUrlTrigger
                id={trigger.id}
                trigger={trigger}
                onUpdateTrigger={jest.fn()}
                onDeleteTrigger={jest.fn()}
                onTriggerValidationUpdate={jest.fn()}
            />
        )

        act(() => {
            expect(getByText('Current URL')).toBeInTheDocument()
            expect(getByTestId('button-add-value')).toBeInTheDocument()
        })
    })

    it('should render correctly if have more values', () => {
        const trigger = createTrigger(CampaignTriggerType.CurrentUrl)
        trigger.value = ['http://bing.com', 'http://google.com']

        const {getAllByTestId} = render(
            <CurrentUrlTrigger
                id={trigger.id}
                trigger={trigger}
                onUpdateTrigger={jest.fn()}
                onDeleteTrigger={jest.fn()}
                onTriggerValidationUpdate={jest.fn()}
            />
        )

        expect(getAllByTestId('current-url-input')).toHaveLength(2)
        expect(
            getAllByTestId('current-url-input')[0].getAttribute('value')
        ).toBe('http://bing.com')
        expect(
            getAllByTestId('current-url-input')[1].getAttribute('value')
        ).toBe('http://google.com')
    })

    it('should be able to click Add URL button', () => {
        const trigger = createTrigger(CampaignTriggerType.CurrentUrl)
        trigger.value = ['http://bing.com']

        const {getAllByTestId, getByText, getByTestId} = render(
            <CurrentUrlTrigger
                id={trigger.id}
                trigger={trigger}
                onUpdateTrigger={jest.fn()}
                onDeleteTrigger={jest.fn()}
                onTriggerValidationUpdate={jest.fn()}
            />
        )

        expect(getAllByTestId('current-url-input')).toHaveLength(1)

        const btn = getByTestId('button-add-value')
        act(() => {
            fireEvent.click(btn)
        })

        expect(getAllByTestId('current-url-input')).toHaveLength(2)

        expect(
            getAllByTestId('current-url-input')[0].getAttribute('value')
        ).toBe('http://bing.com')
        expect(
            getAllByTestId('current-url-input')[1].getAttribute('value')
        ).toBe('')
        expect(getByText('Value is required')).toBeInTheDocument()
    })

    it('should render validation errors', () => {
        const trigger = createTrigger(CampaignTriggerType.CurrentUrl)
        trigger.operator = CampaignTriggerOperator.Eq

        const {getAllByTestId, getByText} = render(
            <CurrentUrlTrigger
                id={trigger.id}
                trigger={trigger}
                onUpdateTrigger={jest.fn()}
                onDeleteTrigger={jest.fn()}
                onTriggerValidationUpdate={jest.fn()}
            />
        )

        const input = getAllByTestId('current-url-input')[0]
        fireEvent.change(input, {target: {value: '/%'}})
        fireEvent.blur(input)

        expect(
            getByText(
                'The URL appears to be malformed. Please review and re-enter.'
            )
        ).toBeInTheDocument()
    })

    it('should be deleted after all values are deleted', () => {
        const trigger = createTrigger(CampaignTriggerType.CurrentUrl)
        trigger.value = ['http://bing.com', 'http://example.com']

        const updateTriggerMock = jest.fn()
        const deleteTriggerMock = jest.fn()

        const {getAllByTestId, queryAllByTestId} = render(
            <CurrentUrlTrigger
                id={trigger.id}
                trigger={trigger}
                onUpdateTrigger={updateTriggerMock}
                onDeleteTrigger={deleteTriggerMock}
                onTriggerValidationUpdate={jest.fn()}
            />
        )

        let deleteButtons = getAllByTestId('button-delete-value')

        act(() => {
            fireEvent.click(deleteButtons[0])
        })
        expect(getAllByTestId('current-url-input')).toHaveLength(1)
        expect(updateTriggerMock).toHaveBeenCalledTimes(1)

        deleteButtons = getAllByTestId('button-delete-value')
        act(() => {
            fireEvent.click(deleteButtons[0])
        })

        expect(queryAllByTestId('current-url-input')).toHaveLength(0)
        expect(deleteTriggerMock).toHaveBeenCalledTimes(1)
    })
})
