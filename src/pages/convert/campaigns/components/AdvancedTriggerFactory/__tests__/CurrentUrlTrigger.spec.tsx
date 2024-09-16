import React from 'react'
import {render, act, fireEvent, screen} from '@testing-library/react'

import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {createTrigger} from 'pages/convert/campaigns/utils/createTrigger'

import {CurrentUrlTrigger} from '../CurrentUrlTrigger'

describe('<CurrentUrlTrigger />', () => {
    it('should render correctly', () => {
        const trigger = createTrigger(CampaignTriggerType.CurrentUrl)

        render(
            <CurrentUrlTrigger
                id={trigger.id}
                trigger={trigger}
                onUpdateTrigger={jest.fn()}
                onDeleteTrigger={jest.fn()}
                onTriggerValidationUpdate={jest.fn()}
            />
        )

        act(() => {
            expect(screen.getByText('Current URL')).toBeInTheDocument()
            expect(screen.getByText('+ Add URL')).toBeInTheDocument()
        })
    })

    it('should render correctly if have more values', () => {
        const trigger = createTrigger(CampaignTriggerType.CurrentUrl)
        trigger.value = ['http://bing.com', 'http://google.com']

        render(
            <CurrentUrlTrigger
                id={trigger.id}
                trigger={trigger}
                onUpdateTrigger={jest.fn()}
                onDeleteTrigger={jest.fn()}
                onTriggerValidationUpdate={jest.fn()}
            />
        )
        const URLs = screen.getAllByLabelText('Current URL')

        expect(URLs).toHaveLength(2)
        expect(URLs[0].getAttribute('value')).toBe('http://bing.com')
        expect(URLs[1].getAttribute('value')).toBe('http://google.com')
    })

    it('should be able to click Add URL button', () => {
        const trigger = createTrigger(CampaignTriggerType.CurrentUrl)
        trigger.value = ['http://bing.com']

        render(
            <CurrentUrlTrigger
                id={trigger.id}
                trigger={trigger}
                onUpdateTrigger={jest.fn()}
                onDeleteTrigger={jest.fn()}
                onTriggerValidationUpdate={jest.fn()}
            />
        )
        const URLsBefore = screen.getAllByLabelText('Current URL')

        expect(URLsBefore).toHaveLength(1)

        const btn = screen.getByText('+ Add URL')

        act(() => {
            fireEvent.click(btn)
        })

        const URLsAfter = screen.getAllByLabelText('Current URL')

        expect(URLsAfter).toHaveLength(2)
        expect(URLsAfter[0].getAttribute('value')).toBe('http://bing.com')
        expect(URLsAfter[1].getAttribute('value')).toBe('')
        expect(screen.getByText('Value is required')).toBeInTheDocument()
    })

    it('should render validation errors', () => {
        const trigger = createTrigger(CampaignTriggerType.CurrentUrl)
        trigger.operator = CampaignTriggerOperator.Eq

        render(
            <CurrentUrlTrigger
                id={trigger.id}
                trigger={trigger}
                onUpdateTrigger={jest.fn()}
                onDeleteTrigger={jest.fn()}
                onTriggerValidationUpdate={jest.fn()}
            />
        )

        const input = screen.getAllByRole('textbox', {name: 'Current URL'})[0]
        fireEvent.change(input, {target: {value: '/%'}})
        fireEvent.blur(input)

        expect(
            screen.getByText(
                'The URL appears to be malformed. Please review and re-enter.'
            )
        ).toBeInTheDocument()
    })

    it('should be deleted after all values are deleted', () => {
        const trigger = createTrigger(CampaignTriggerType.CurrentUrl)
        trigger.value = ['http://bing.com', 'http://example.com']

        const updateTriggerMock = jest.fn()
        const deleteTriggerMock = jest.fn()

        render(
            <CurrentUrlTrigger
                id={trigger.id}
                trigger={trigger}
                onUpdateTrigger={updateTriggerMock}
                onDeleteTrigger={deleteTriggerMock}
                onTriggerValidationUpdate={jest.fn()}
            />
        )

        let deleteButtons = screen.getAllByLabelText('Delete URL')

        act(() => {
            fireEvent.click(deleteButtons[0])
        })
        expect(screen.getAllByText('Current URL')).toHaveLength(1)
        expect(updateTriggerMock).toHaveBeenCalledTimes(1)

        deleteButtons = screen.getAllByLabelText('Delete URL')
        act(() => {
            fireEvent.click(deleteButtons[0])
        })

        expect(screen.queryByLabelText('Current URL')).not.toBeInTheDocument()
        expect(deleteTriggerMock).toHaveBeenCalledTimes(1)
    })
})
