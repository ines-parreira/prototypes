import type { NewPhoneNumber } from 'models/phoneNumber/types'

export const mockPhoneNumbers: Record<string, NewPhoneNumber> = {
    '1': {
        id: '1',
        name: '[MKT] Phone 1',
        phone_number_friendly: '+1 555-123-4567',
        phone_number: '+15551234567',
        capabilities: { sms: true, voice: true },
        integrations: [{ id: 1, type: 'sms' }],
    } as unknown as NewPhoneNumber,
    '2': {
        id: '2',
        name: '[MKT] Phone 2',
        phone_number_friendly: '+1 555-987-6543',
        phone_number: '+15559876543',
        capabilities: { sms: true, voice: false },
        integrations: [{ id: 2, type: 'sms' }],
    } as unknown as NewPhoneNumber,
    '3': {
        id: '3',
        name: 'Regular Phone',
        phone_number_friendly: '+1 555-111-2222',
        phone_number: '+15551112222',
        capabilities: { sms: true, voice: true },
        integrations: [{ id: 3, type: 'sms' }],
    } as unknown as NewPhoneNumber,
    '4': {
        id: '4',
        name: '[MKT] Phone 4',
        phone_number_friendly: '+1 555-444-5555',
        phone_number: '+15554445555',
        capabilities: { sms: false, voice: true },
        integrations: [{ id: 4, type: 'sms' }],
    } as unknown as NewPhoneNumber,
    '5': {
        id: '5',
        name: '[MKT] Phone 5',
        phone_number_friendly: '+1 555-666-7777',
        phone_number: '+15556667777',
        capabilities: { sms: true, voice: true },
        integrations: [{ id: 5, type: 'voice' }],
    } as unknown as NewPhoneNumber,
}
