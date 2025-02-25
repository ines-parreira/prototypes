import React from 'react'

import { act, render, screen } from '@testing-library/react'

import { CampaignTriggerMap } from 'pages/convert/campaigns/types/CampaignTriggerMap'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import { createTrigger } from 'pages/convert/campaigns/utils/createTrigger'

import CampaignIncognitoVisitorsSwitch from '../CampaignIncognitoVisitorsSwitch'

describe('<CampaignIncognitoVisitorsSwitch />', () => {
    it('is disabled', () => {
        render(
            <CampaignIncognitoVisitorsSwitch
                triggers={{}}
                onChange={jest.fn()}
            />,
        )

        expect(
            screen.getByText('Incognito visitors will also see the campaign'),
        ).toBeInTheDocument()

        const checkbox: HTMLInputElement = screen.getByLabelText(
            /Incognito visitors will also see the campaign/,
        )
        expect(checkbox).toBeDisabled()
        expect(checkbox.checked).toBeFalsy()
    })

    it('has shopify triggers with non default values and it is disabled', () => {
        const amountSpentTrigger = createTrigger(
            CampaignTriggerType.AmountSpent,
        )
        const triggers = {
            [amountSpentTrigger.id]: {
                ...amountSpentTrigger,
                value: 10,
            },
        } as CampaignTriggerMap

        act(() => {
            render(
                <CampaignIncognitoVisitorsSwitch
                    triggers={triggers}
                    onChange={jest.fn()}
                />,
            )
        })

        expect(
            screen.getByText('Incognito visitors will also see the campaign'),
        ).toBeInTheDocument()

        const checkbox: HTMLInputElement = screen.getByLabelText(
            /Incognito visitors will also see the campaign/,
        )
        expect(checkbox.getAttribute('disabled')).toBe('')
        expect(checkbox.checked).toBeFalsy()
    })

    it('has shopify triggers with default values and it is enabled', () => {
        const amountSpentTrigger = createTrigger(
            CampaignTriggerType.AmountSpent,
        )
        const triggers = {
            [amountSpentTrigger.id]: {
                ...amountSpentTrigger,
                value: 0,
            },
        } as CampaignTriggerMap

        act(() => {
            render(
                <CampaignIncognitoVisitorsSwitch
                    triggers={triggers}
                    onChange={jest.fn()}
                />,
            )
        })
        const checkbox: HTMLInputElement = screen.getByLabelText(
            /Incognito visitors will also see the campaign/,
        )
        expect(checkbox.getAttribute('disabled')).toBe('')
        expect(checkbox.checked).toBeTruthy()
    })

    it('has shopify triggers with non default values and it is forced', () => {
        const amountSpentTrigger = createTrigger(
            CampaignTriggerType.AmountSpent,
        )
        const incognitoTrigger = createTrigger(
            CampaignTriggerType.IncognitoVisitor,
        )
        const triggers = {
            [amountSpentTrigger.id]: {
                ...amountSpentTrigger,
                value: 10,
            },
            [incognitoTrigger.id]: incognitoTrigger,
        } as CampaignTriggerMap

        act(() => {
            render(
                <CampaignIncognitoVisitorsSwitch
                    triggers={triggers}
                    onChange={jest.fn()}
                />,
            )
        })
        const checkbox: HTMLInputElement = screen.getByLabelText(
            /Incognito visitors will also see the campaign/,
        )
        expect(checkbox.getAttribute('disabled')).toBe('')
        expect(checkbox.checked).toBeTruthy()
    })
})
