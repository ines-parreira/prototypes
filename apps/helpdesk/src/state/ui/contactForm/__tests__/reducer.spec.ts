import { changeContactFormId } from 'state/ui/contactForm/actions'
import { DefaultExportReducer as reducer } from 'state/ui/contactForm/reducer'

describe('Contact Form/UI reducer', () => {
    describe('dispatch changeContactFormId', () => {
        it('updates the current contact form id', () => {
            const nextState = reducer(undefined, changeContactFormId(1))

            expect(nextState.currentId).toEqual(1)
        })
    })
})
