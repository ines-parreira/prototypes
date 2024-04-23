import React from 'react'
import {act} from 'react-dom/test-utils'
import {fireEvent, render} from '@testing-library/react'

import {AdvancedTriggersSelect} from '../AdvancedTriggersSelect'

jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return jest.fn(() => {
        return <div data-testid="mock-convert-subscription-modal" />
    })
})

describe('<AdvancedTriggersSelect />', () => {
    it('triggers the onClick with the right trigger key', () => {
        const onClickFn = jest.fn()

        const {getByText} = render(
            <AdvancedTriggersSelect onClick={onClickFn} />
        )

        const buttonEl = getByText('Add condition')

        act(() => {
            fireEvent.click(buttonEl)
        })

        act(() => {
            fireEvent.click(getByText('Current URL'))
        })

        expect(onClickFn).toBeCalledWith('current_url')
    })

    it('renders the legacy triggers', () => {
        const onClickFn = jest.fn()

        const {getByText} = render(
            <AdvancedTriggersSelect onClick={onClickFn} />
        )

        const buttonEl = getByText('Add condition')

        act(() => {
            fireEvent.click(buttonEl)
        })

        getByText('Current URL')
        getByText('Time spent on page')
    })

    it('renders the legacy and revenue triggers', () => {
        const onClickFn = jest.fn()

        const {getByText} = render(
            <AdvancedTriggersSelect isConvertSubscriber onClick={onClickFn} />
        )

        const buttonEl = getByText('Add condition')

        act(() => {
            fireEvent.click(buttonEl)
        })

        getByText('Business hours')
        getByText('Current URL')
        getByText('Time spent on page')
    })

    it('renders options for upsell when is light campaign', () => {
        const onClickFn = jest.fn()

        const {getByText} = render(
            <AdvancedTriggersSelect isLightCampaign onClick={onClickFn} />
        )

        const buttonEl = getByText('Add condition')

        act(() => {
            fireEvent.click(buttonEl)
        })

        // keeps the simple triggers non-disabled
        const currentUrlTrigger = getByText('Current URL')
        const timeSpentTrigger = getByText('Time spent on page')
        expect(currentUrlTrigger).toBeInTheDocument()
        expect(timeSpentTrigger).toBeInTheDocument()
        expect(currentUrlTrigger.className).not.toMatch(/disabled/)
        expect(timeSpentTrigger.className).not.toMatch(/disabled/)

        // lists the rest of triggers as disabled
        const numberOfVisits = getByText('Number of visits')
        const businessHours = getByText('Business hours')
        expect(numberOfVisits).toBeInTheDocument()
        expect(businessHours).toBeInTheDocument()
        expect(numberOfVisits.className).toMatch(/disabled/)
        expect(businessHours.className).toMatch(/disabled/)

        // displays button to upgrade
        getByText('Subscribe To Convert')
    })

    it('does not render upsell option for subscribers', () => {
        const onClickFn = jest.fn()

        const {getByText, queryByText} = render(
            <AdvancedTriggersSelect
                isConvertSubscriber
                isLightCampaign
                onClick={onClickFn}
            />
        )

        const buttonEl = getByText('Add condition')

        act(() => {
            fireEvent.click(buttonEl)
        })

        expect(queryByText('Subscribe To Convert')).not.toBeInTheDocument()
    })
})
