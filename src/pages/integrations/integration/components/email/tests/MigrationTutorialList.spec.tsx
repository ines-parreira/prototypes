import {cleanup, render, screen} from '@testing-library/react'
import React from 'react'
import {providerTutorials} from '../EmailMigration/constants'
import MigrationTutorialList from '../EmailMigration/MigrationTutorialList'

describe('MigrationTutorialList', () => {
    const renderComponent = () =>
        render(
            <MigrationTutorialList
                tutorials={providerTutorials}
                description={<div data-testid="tutorials-description" />}
                footer={<div data-testid="tutorials-footer" />}
            />
        )

    afterEach(cleanup)

    it.each(['Outlook', 'Google Groups', 'Microsoft Exchange', 'Zoho Mail'])(
        'should render Outlook, Google Groups, Microsoft Exchange and Zoho tutorials',
        (label) => {
            renderComponent()
            expect(screen.getByText(label)).toBeVisible()
        }
    )

    it('should display description and footer', () => {
        renderComponent()
        expect(screen.getByTestId('tutorials-description')).toBeVisible()
        expect(screen.getByTestId('tutorials-footer')).toBeVisible()
    })

    it.each([
        {
            name: 'Outlook',
            docsUrl:
                'https://docs.gorgias.com/en-US/outlook-81755#forwarding-via-inbox-rules',
            providerSettingsText: 'Outlook inbox',
            providerSettingsUrl: 'https://outlook.live.com/mail/0/inbox',
        },
        {
            name: 'Google Groups',
            docsUrl: 'https://docs.gorgias.com/en-US/gmail-81754#gmailgroup',
            providerSettingsText: 'Gmail forwarding settings',
            providerSettingsUrl:
                'https://mail.google.com/mail/u/0/#settings/fwdandpop',
        },
        {
            name: 'Microsoft Exchange',
            docsUrl: 'https://docs.gorgias.com/en-US/outlook-81755#exchange',
            providerSettingsText: 'server-side forwarding with Exchange',
            providerSettingsUrl:
                'https://docs.microsoft.com/en-us/exchange/recipients/user-mailboxes/email-forwarding?view=exchserver-2019',
        },
        {
            name: 'Zoho Mail',
            docsUrl: 'https://docs.gorgias.com/en-US/other-provider-81758#zoho',
            providerSettingsText: 'Zoho settings',
            providerSettingsUrl:
                'https://mail.zoho.com.au/zm/#settings/all/mailaccounts',
        },
    ])('should display link to provider settings and docs', (provider) => {
        renderComponent()
        const helpDocsLink = screen.getByRole<HTMLAnchorElement>('link', {
            name: `menu_book ${provider.name} Help Docs`,
        })
        const providerSettingsLink = screen.getByRole<HTMLAnchorElement>(
            'link',
            {
                name: provider.providerSettingsText,
            }
        )
        expect(helpDocsLink.href).toBe(provider.docsUrl)
        expect(providerSettingsLink.href).toBe(provider.providerSettingsUrl)
    })
})
