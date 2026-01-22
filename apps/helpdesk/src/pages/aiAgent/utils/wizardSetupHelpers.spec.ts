import type { StoreConfiguration } from 'models/aiAgent/types'

import { isWizardSetupCompleted } from './wizardSetupHelpers'

describe('wizardSetupHelpers', () => {
    describe('isWizardSetupCompleted', () => {
        it('returns false for null config', () => {
            expect(isWizardSetupCompleted(null)).toBe(false)
        })

        it('returns false for undefined config', () => {
            expect(isWizardSetupCompleted(undefined)).toBe(false)
        })

        it('returns true when no wizard object exists (legacy stores)', () => {
            const config = {
                storeName: 'test-store',
                accountDomain: 'test.gorgias.com',
            } as unknown as StoreConfiguration

            expect(isWizardSetupCompleted(config)).toBe(true)
        })

        it('returns false when wizard.completedDatetime is null', () => {
            const config = {
                storeName: 'test-store',
                accountDomain: 'test.gorgias.com',
                wizard: {
                    completedDatetime: null,
                },
            } as unknown as StoreConfiguration

            expect(isWizardSetupCompleted(config)).toBe(false)
        })

        it('returns true when wizard.completedDatetime is set', () => {
            const config = {
                storeName: 'test-store',
                accountDomain: 'test.gorgias.com',
                wizard: {
                    completedDatetime: '2024-01-15T10:30:00Z',
                },
            } as unknown as StoreConfiguration

            expect(isWizardSetupCompleted(config)).toBe(true)
        })
    })
})
