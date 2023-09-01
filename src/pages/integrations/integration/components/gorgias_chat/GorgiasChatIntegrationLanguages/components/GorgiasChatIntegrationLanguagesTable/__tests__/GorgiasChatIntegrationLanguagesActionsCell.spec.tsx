import React from 'react'
import {render} from '@testing-library/react'

import {GorgiasChatIntegrationLanguagesTableRowActions} from '../GorgiasChatIntegrationLanguagesTableRowActions'
import {LanguageItemRow} from '../types'

describe('<GorgiasChatIntegrationLanguagesTableRowActions />', () => {
    it('renders actions if show actions is enabled', () => {
        const onClickSetAsDefault = jest.fn()
        const onClickDelete = jest.fn()
        const language = {
            language: 'en-US',
            primary: true,
            label: 'English (US)',
            link: '/app/settings/channels/GorgiasChat/1/language/en-US',
            showActions: true,
        } as LanguageItemRow

        const {getByText} = render(
            <GorgiasChatIntegrationLanguagesTableRowActions
                language={language}
                onClickDelete={onClickDelete}
                onClickSetAsDefault={onClickSetAsDefault}
            />
        )

        getByText('Customize')
        getByText('more_vert')
        getByText('Make default language')
        getByText('Delete')
    })

    it('renders no actions if show actions is disabled', () => {
        const onClickSetAsDefault = jest.fn()
        const onClickDelete = jest.fn()
        const language = {
            language: 'en-US',
            primary: true,
            label: 'English (US)',
            link: '/app/settings/channels/GorgiasChat/1/language/en-US',
            showActions: false,
        } as LanguageItemRow

        const {getByText, findByText} = render(
            <GorgiasChatIntegrationLanguagesTableRowActions
                language={language}
                onClickDelete={onClickDelete}
                onClickSetAsDefault={onClickSetAsDefault}
            />
        )

        getByText('Customize')
        expect(findByText('more_vert')).not.toBeFalsy()
        expect(findByText('Make default language')).not.toBeFalsy()
        expect(findByText('Delete')).not.toBeFalsy()
    })

    it('calls onClickSetAsDefault with passed language', () => {
        const onClickSetAsDefault = jest.fn()
        const onClickDelete = jest.fn()
        const language = {
            language: 'en-US',
            primary: true,
            label: 'English (US)',
            link: '/app/settings/channels/GorgiasChat/1/language/en-US',
            showActions: true,
        } as LanguageItemRow

        const {getByText} = render(
            <GorgiasChatIntegrationLanguagesTableRowActions
                language={language}
                onClickDelete={onClickDelete}
                onClickSetAsDefault={onClickSetAsDefault}
            />
        )

        getByText('more_vert').click()
        getByText('Make default language').click()
        expect(onClickSetAsDefault).toHaveBeenCalledWith(language)
    })

    it('calls onClickDelete with passed language', () => {
        const onClickSetAsDefault = jest.fn()
        const onClickDelete = jest.fn()
        const language = {
            language: 'en-US',
            primary: true,
            label: 'English (US)',
            link: '/app/settings/channels/GorgiasChat/1/language/en-US',
            showActions: true,
        } as LanguageItemRow

        const {getByText} = render(
            <GorgiasChatIntegrationLanguagesTableRowActions
                language={language}
                onClickDelete={onClickDelete}
                onClickSetAsDefault={onClickSetAsDefault}
            />
        )

        getByText('more_vert').click()
        getByText('Delete').click()
        expect(onClickDelete).toHaveBeenCalledWith(language)
    })
})
