export const contactInfoFixture = {
    email: {
        description: 'Description under email',
        enabled: false,
        email: 'foo@bar.com',
    },
    phone: {
        description: 'Description under phone numbers',
        phoneNumbers: [
            {
                reference: 'FR 🇫🇷',
                phoneNumber: '+33123456789',
                formattedPhoneNumber: '+33 1 23 45 67 89',
            },
            {
                reference: 'USA 🇺🇸',
                phoneNumber: '+112312323222',
                formattedPhoneNumber: '+1 231 232 3222',
            },
        ],

        enabled: false,
    },
    chat: {
        description: 'Start live conversation with our agents',
        enabled: false,
    },
}
