export const SUPPORT_EMAIL = 'support@gorgias.com'

export type SupportContentDropdownOption = {
    label: string
    value: string
    learnMoreURL?: string
}

export const supportContentDropdownOptions: SupportContentDropdownOption[] = [
    {
        label: 'Standard guidelines',
        value: '',
    },
    {
        label: 'GoDaddy',
        value: 'godaddy',
        learnMoreURL: 'https://www.godaddy.com/help/manage-dns-records-680',
    },
    {
        label: 'Namecheap',
        value: 'namecheap',
        learnMoreURL:
            'https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/',
    },
    {
        label: 'Bluehost',
        value: 'bluehost',
        learnMoreURL:
            'https://www.bluehost.com/help/article/dns-management-add-edit-or-delete-dns-entries',
    },
    {
        label: 'HostGator',
        value: 'hostgator',
        learnMoreURL:
            'https://www.hostgator.com/help/article/how-do-i-change-my-sites-mx-record-to-point-mail-to-another-server-or-domain',
    },
    {
        label: 'Squarespace (ex Google Domains)',
        value: 'squarespace',
        learnMoreURL:
            'https://support.squarespace.com/hc/en-us/articles/360002101888-Adding-custom-DNS-records-to-your-Squarespace-managed-domain?platform=v6&error=zendesk&message=zendesk-no-externalid',
    },
    {
        label: 'Name.com',
        value: 'namecom',
        learnMoreURL:
            'https://www.name.com/support/articles/206127137-adding-dns-records-and-templates',
    },
    {
        label: '1&1 Ionos',
        value: 'ionos',
        learnMoreURL:
            'https://www.ionos.com/help/domains/configuring-mail-servers-and-other-related-records/using-a-domain-with-another-providers-mail-servers-editing-mx-records',
    },
    {
        label: 'Hostinger',
        value: 'hostinger',
        learnMoreURL:
            'https://support.hostinger.com/en/articles/1583249-how-to-manage-dns-records-at-hostinger',
    },
    {
        label: 'Dreamhost',
        value: 'dreamhost',
        learnMoreURL:
            'https://help.dreamhost.com/hc/en-us/articles/215035818-Locating-your-DreamHost-email-DNS-records',
    },
    {
        label: 'Shopify',
        value: 'shopify',
        learnMoreURL:
            'https://help.shopify.com/en/manual/domains/managing-domains/edit-dns-settings',
    },
]

export const commonDomains = [
    'gmail.',
    'yahoo.',
    'hotmail.',
    'aol.',
    'hotmail.',
    'msn.',
    'wanadoo.',
    'orange.',
    'cast.',
    'live.',
    'rediffmail.',
    'comcast.',
    'free.',
    'gmx.',
    'web.',
    'yandex.',
    'ymail.',
    'libero.',
    'outlook.',
    'googlemail.',
]
