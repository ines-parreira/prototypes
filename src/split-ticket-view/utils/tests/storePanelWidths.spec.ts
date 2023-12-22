import {LayoutKeys} from '../../constants'
import storePanelWidths from '../storePanelWidths'

describe('storePanelWidths', () => {
    it('should store widths in localStorage', () => {
        jest.useFakeTimers()
        const widths = [1, 2, 3, 4]
        const localStorageSpy = jest.spyOn(window.localStorage, 'setItem')

        storePanelWidths(LayoutKeys.TICKET, widths)
        jest.runOnlyPendingTimers()

        expect(localStorageSpy).toHaveBeenCalledWith('navbar-width', '1')
        expect(localStorageSpy).toHaveBeenCalledWith('ticket-list-width', '2')
        expect(localStorageSpy).toHaveBeenCalledWith(
            LayoutKeys.TICKET,
            '1,2,3,4'
        )
        expect(localStorageSpy).toHaveBeenCalledWith('infobar-width', '4')
        jest.useRealTimers()
    })
})
