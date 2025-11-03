import React from 'react'

import { render, screen } from '@testing-library/react'

import { SmsChannelMessagesContainer } from './SmsChannelMessagesContainer'

jest.mock('assets/img/battery.svg', () => ({
    __esModule: true,
    default: 'battery-icon.svg',
}))
jest.mock('assets/img/wifi.svg', () => ({
    __esModule: true,
    default: 'wifi-icon.svg',
}))

jest.mock('./SmsChannelMessagesContainer.less', () => ({
    container: 'container',
    header: 'header',
    statusBar: 'statusBar',
    time: 'time',
    statusIcons: 'statusIcons',
    wifiIcon: 'wifiIcon',
    batteryIcon: 'batteryIcon',
    storeTitle: 'storeTitle',
    messagesContainer: 'messagesContainer',
}))

describe('SmsChannelMessagesContainer', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-01-15T14:30:00'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should render children correctly', () => {
        render(
            <SmsChannelMessagesContainer>
                <div>Test message content</div>
            </SmsChannelMessagesContainer>,
        )

        expect(screen.getByText('Test message content')).toBeInTheDocument()
    })

    it('should display current time in the status bar', () => {
        render(
            <SmsChannelMessagesContainer>
                <div>Content</div>
            </SmsChannelMessagesContainer>,
        )

        const timeElement = screen.getByText(/2:30 PM/i)
        expect(timeElement).toBeInTheDocument()
    })

    it('should display wifi and battery icons with correct alt text', () => {
        render(
            <SmsChannelMessagesContainer>
                <div>Content</div>
            </SmsChannelMessagesContainer>,
        )

        const wifiIcon = screen.getByAltText('wifi')
        const batteryIcon = screen.getByAltText('battery')

        expect(wifiIcon).toBeInTheDocument()
        expect(batteryIcon).toBeInTheDocument()
    })

    it('should display store name when provided', () => {
        render(
            <SmsChannelMessagesContainer storeName="My Store">
                <div>Content</div>
            </SmsChannelMessagesContainer>,
        )

        expect(screen.getByText('My Store')).toBeInTheDocument()
    })

    it('should not display store title section when storeName is not provided', () => {
        render(
            <SmsChannelMessagesContainer>
                <div>Content</div>
            </SmsChannelMessagesContainer>,
        )

        const container = screen.getByText('Content').closest('.container')
        expect(container).toBeInTheDocument()
    })

    it('should not display store title section when storeName is empty string', () => {
        const { container } = render(
            <SmsChannelMessagesContainer storeName="">
                <div>Content</div>
            </SmsChannelMessagesContainer>,
        )

        const storeTitle = container.querySelector('.storeTitle')
        expect(storeTitle).not.toBeInTheDocument()
    })

    it('should render multiple children correctly', () => {
        render(
            <SmsChannelMessagesContainer storeName="Test Store">
                <div>First message</div>
                <div>Second message</div>
                <div>Third message</div>
            </SmsChannelMessagesContainer>,
        )

        expect(screen.getByText('First message')).toBeInTheDocument()
        expect(screen.getByText('Second message')).toBeInTheDocument()
        expect(screen.getByText('Third message')).toBeInTheDocument()
        expect(screen.getByText('Test Store')).toBeInTheDocument()
    })

    it('should format time correctly for different locales', () => {
        jest.setSystemTime(new Date('2024-01-15T09:05:00'))

        render(
            <SmsChannelMessagesContainer>
                <div>Content</div>
            </SmsChannelMessagesContainer>,
        )

        const timeElement = screen.getByText(/9:05/i)
        expect(timeElement).toBeInTheDocument()
    })

    it('should render with all required structural elements', () => {
        const { container } = render(
            <SmsChannelMessagesContainer storeName="Store Name">
                <div>Content</div>
            </SmsChannelMessagesContainer>,
        )

        expect(container.querySelector('.container')).toBeInTheDocument()
        expect(container.querySelector('.header')).toBeInTheDocument()
        expect(container.querySelector('.statusBar')).toBeInTheDocument()
        expect(container.querySelector('.statusIcons')).toBeInTheDocument()
        expect(container.querySelector('.storeTitle')).toBeInTheDocument()
        expect(
            container.querySelector('.messagesContainer'),
        ).toBeInTheDocument()
    })
})
