import {TicketMessageSourceType} from '../../../../business/types/ticket'
import {getPersonLabelFromSource} from '../utils.js'

describe('getPersonLabelFromSource()', () => {
    it('should return email label', () => {
        const person = {address: 'foo@bar.com', name: 'Foo Bar'}
        const sourceType = TicketMessageSourceType.Email

        const label = getPersonLabelFromSource(person, sourceType)

        expect(label).toMatchSnapshot()
    })

    it('should return phone label', () => {
        const person = {address: '+14151235555', name: 'Foo Bar'}
        const sourceType = TicketMessageSourceType.Phone

        const label = getPersonLabelFromSource(person, sourceType)

        expect(label).toMatchSnapshot()
    })
})
