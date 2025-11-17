import { initialState as contactformState } from 'state/entities/contactForm/reducer'
import type { StoreState } from 'state/types'
import { getCurrentContactFormId } from 'state/ui/contactForm/selectors'

import { initialState as uiState } from '../reducer'

const store: Partial<StoreState> = {
    entities: {
        contactForm: contactformState,
    } as any,
    ui: { contactForm: uiState } as any,
}

const nextStore: Partial<StoreState> = {
    entities: {
        contactForm: contactformState,
    } as any,
    ui: {
        contactForm: { ...uiState, currentId: 1 },
    } as any,
}

describe('Contact Form/UI selectors', () => {
    describe('getCurrentContactFormId()', () => {
        it('reads the current help center id', () => {
            expect(getCurrentContactFormId(store as StoreState)).toEqual(null)

            expect(getCurrentContactFormId(nextStore as StoreState)).toEqual(1)
        })
    })
})
