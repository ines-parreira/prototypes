import React from 'react'
import outlookIcon from 'assets/img/integrations/outlook.svg'
import googleGroupsIcon from 'assets/img/integrations/google-groups.svg'
import exchangeIcon from 'assets/img/integrations/exchange.svg'
import zohoIcon from 'assets/img/integrations/zoho.svg'

export const providerTutorials = [
    {
        name: 'Outlook',
        icon: outlookIcon,
        helpDocsUrl:
            'https://docs.gorgias.com/en-US/outlook-81755#forwarding-via-inbox-rules',
        instructions: [
            {
                message: (
                    <span>
                        <strong>Copy the Gorgias email</strong> provided on the
                        left
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Open your{' '}
                        <a
                            href="https://outlook.live.com/mail/0/inbox"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Outlook inbox
                        </a>{' '}
                        (or sign in)
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Click{' '}
                        <strong>{`Settings -> View all Outlook settings`}</strong>
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Click <strong>'Forwarding'</strong> and tick{' '}
                        <strong>'Enable forwarding'</strong>
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        <strong>Paste the Gorgias email</strong> into the email
                        address field
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Tick{' '}
                        <strong>'Keep a copy of forwarded messages'</strong> and
                        save.
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        All set! <strong>Verify forwarding</strong> for the
                        email in the table on the left.
                    </span>
                ),
            },
        ],
    },
    {
        name: 'Google Groups',
        icon: googleGroupsIcon,
        helpDocsUrl: 'https://docs.gorgias.com/en-US/gmail-81754#gmailgroup',
        instructions: [
            {
                message: (
                    <span>
                        <strong>Copy the Gorgias email</strong> provided on the
                        left
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Open{' '}
                        <a
                            href="https://mail.google.com/mail/u/0/#settings/fwdandpop"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Gmail forwarding settings
                        </a>{' '}
                        and click <strong>'Add forwarding address'</strong>
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        <strong>Paste the Gorgias email</strong> and{' '}
                        <strong>confirm</strong> the changes
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Go to <strong>Gorgias Tickets</strong> and{' '}
                        <strong>open the email ticket</strong> containing the
                        confirmation link
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        After confirming, open the{' '}
                        <a
                            href="https://admin.google.com/ac/groups/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Gmail Groups page
                        </a>
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Click <strong>Edit settings</strong> {`->`}{' '}
                        <strong>'Edit icon'</strong> (pencil)
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Enable{' '}
                        <strong>'Publish posts to external source'</strong> and{' '}
                        <strong>
                            'Allow members outside your organization'
                        </strong>
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Save. Click <strong>'Add members'</strong> and{' '}
                        <strong>paste the Gorgias email</strong> into the user
                        field.
                        <br />
                        <br />
                        Then <strong>'Add to Group'</strong>{' '}
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        All set! <strong>Verify forwarding</strong> for the
                        email in the table on the left.
                    </span>
                ),
            },
        ],
    },
    {
        name: 'Microsoft Exchange',
        icon: exchangeIcon,
        helpDocsUrl: 'https://docs.gorgias.com/en-US/outlook-81755#exchange',
        instructions: [
            {
                message: (
                    <span>
                        <strong>Copy the Gorgias email</strong> provided on the
                        left
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Set up{' '}
                        <a
                            href="https://docs.microsoft.com/en-us/exchange/recipients/user-mailboxes/email-forwarding?view=exchserver-2019"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            server-side forwarding with Exchange
                        </a>{' '}
                        by going to <strong>{`Recipients -> Mailboxes`}</strong>{' '}
                        in the Exchange admin center
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Select the relevant mailbox to set up forwarding for,
                        and click <strong>'Edit'</strong>
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        In mailbox properties page, click{' '}
                        <strong>'Mailbox Features'</strong>{' '}
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Under <strong>'Mail Flow'</strong> select{' '}
                        <strong>'View details'</strong>
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Click <strong>'Enable forwarding'</strong>, then{' '}
                        <strong>'Browse'</strong>
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        On the <strong>Select Recipient</strong> page, select
                        the user to forward all emails to with the Gorgias email
                        as the forwarding recipient
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        All set! <strong>Verify forwarding</strong> for the
                        email in the table on the left.
                    </span>
                ),
            },
        ],
    },
    {
        name: 'Zoho Mail',
        icon: zohoIcon,
        helpDocsUrl: 'https://docs.gorgias.com/en-US/other-provider-81758#zoho',
        instructions: [
            {
                message: (
                    <span>
                        <strong>Copy the Gorgias email</strong> provided on the
                        left
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Open your{' '}
                        <a
                            href="https://mail.zoho.com.au/zm/#settings/all/mailaccounts"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Zoho settings
                        </a>
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        <strong>Paste the Gorgias email</strong> into the{' '}
                        <strong>'Add new email'</strong> field, then press{' '}
                        <strong>'Enter'</strong>
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        Click <strong>'Verify'</strong> and navigate to{' '}
                        <strong>Gorgias Tickets</strong>
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        <strong>Open the email ticket</strong> from Zoho Mail
                        and <strong>copy</strong> the confirmation code
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        In Zoho settings,{' '}
                        <strong>enter the verification code</strong>, then press{' '}
                        <strong>'Confirm'</strong>
                    </span>
                ),
            },
            {
                message: (
                    <span>
                        All set! <strong>Verify forwarding</strong> for the
                        email in the table on the left.
                    </span>
                ),
            },
        ],
    },
]
