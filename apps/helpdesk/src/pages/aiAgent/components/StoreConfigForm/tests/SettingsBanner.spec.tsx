import React from 'react'

import { render, screen } from '@testing-library/react'

import { userEvent } from 'utils/testing/userEvent'

import { BannerText, SettingsBannerType } from '../constants'
import { SettingsBanner } from '../FormComponents/SettingsBanner'

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {}

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value
        },
        clear: () => {
            store = {}
        },
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
})

describe('SettingsBanner', () => {
    const type = SettingsBannerType.Chat

    beforeEach(() => {
        localStorage.clear()
    })

    it('should not show the banner if deactivatedDatetime is not provided', () => {
        render(<SettingsBanner type={type} />)
        expect(screen.queryByText(BannerText[type])).not.toBeInTheDocument()
    })

    it('should show the banner if deactivatedDatetime is provided and localStorage has no acknowledgment', () => {
        render(<SettingsBanner type={type} deactivatedDatetime="2024-09-24" />)
        expect(screen.queryByText(BannerText[type])).toBeInTheDocument()
        expect(
            screen.getByText(/When AI Agent is enabled on Chat/),
        ).toBeInTheDocument()
    })

    it('should hide the banner if it has been acknowledged in localStorage', () => {
        localStorage.setItem(`ai-settings-${type}-banner-acknowledged`, 'true')
        render(<SettingsBanner type={type} deactivatedDatetime="2024-09-24" />)
        expect(screen.queryByText(BannerText[type])).not.toBeInTheDocument()
    })

    it('should acknowledge the banner and hide it when "Got it" is clicked', () => {
        render(<SettingsBanner type={type} deactivatedDatetime="2024-09-24" />)
        expect(screen.queryByText(BannerText[type])).toBeInTheDocument()

        userEvent.click(screen.getByText('Got it'))

        expect(
            localStorage.getItem(`ai-settings-${type}-banner-acknowledged`),
        ).toBe('true')
        expect(screen.queryByTestId('alert')).not.toBeInTheDocument()
    })
})
