import type { StoreConfiguration } from 'models/aiAgent/types'

/**
 * Checks if a store has completed the AI agent wizard setup.
 *
 * A store has completed setup when:
 * 1. wizard.completedDatetime is not null (wizard was completed), OR
 * 2. no wizard object exists (legacy stores that were set up before wizard existed)
 *
 * @param storeConfiguration - The store configuration object
 * @returns true if setup is completed, false if still in wizard
 */
export function isWizardSetupCompleted(
    storeConfiguration: StoreConfiguration | null | undefined,
): boolean {
    if (!storeConfiguration) {
        return false
    }

    // No wizard object = legacy store = completed
    if (!storeConfiguration.wizard) {
        return true
    }

    // Wizard exists: check if completedDatetime is set
    return storeConfiguration.wizard.completedDatetime !== null
}
