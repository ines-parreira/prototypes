import {LayoutKeys} from '../../constants'
import storePanelWidths from '../storePanelWidths'

describe('storePanelWidths', () => {
    afterEach(() => {
        jest.useRealTimers()
    })

    it('should store widths in localStorage', () => {
        jest.useFakeTimers()
        const widths = [1, 2, 3, 4]
        const localStorageSpy = jest.spyOn(Storage.prototype, 'setItem')

        storePanelWidths(LayoutKeys.TICKET, widths)
        jest.runOnlyPendingTimers()

        expect(localStorageSpy).toHaveBeenCalledWith('navbar-width', '1')
        expect(localStorageSpy).toHaveBeenCalledWith(
            'ticket-list-width',
            'v2;2'
        )
        expect(localStorageSpy).toHaveBeenCalledWith(
            LayoutKeys.TICKET,
            'v2;1,2,3,4'
        )
        expect(localStorageSpy).toHaveBeenCalledWith('infobar-width', '4')
    })

    it('should not store ticket-list-width if not on a TICKET or VIEW layout', () => {
        jest.useFakeTimers()
        const widths = [1, 2, 3]
        const localStorageSpy = jest.spyOn(Storage.prototype, 'setItem')

        storePanelWidths(LayoutKeys.FULL_TICKET, widths)
        jest.runOnlyPendingTimers()

        expect(localStorageSpy).toHaveBeenCalledWith('navbar-width', '1')
        expect(localStorageSpy).not.toHaveBeenCalledWith(
            'ticket-list-width',
            'v2;2'
        )
        expect(localStorageSpy).toHaveBeenCalledWith(
            LayoutKeys.FULL_TICKET,
            'v2;1,2,3'
        )
        expect(localStorageSpy).toHaveBeenCalledWith('infobar-width', '3')
    })
})
