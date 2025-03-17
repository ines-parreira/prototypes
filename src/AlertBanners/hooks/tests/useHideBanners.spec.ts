import { renderHook } from '@testing-library/react-hooks'

import { useHideBanners } from '../useHideBanners'

describe('useHideBanners', () => {
    let observerMock: jest.Mock
    let mockedObserver: jest.Mock

    beforeEach(() => {
        observerMock = jest.fn()
        mockedObserver = jest.fn((callback) => ({
            observe: observerMock,
            disconnect: jest.fn(),
            takeRecords: jest.fn(() => {
                callback([], observerMock as any)
            }),
        }))
        global.MutationObserver = mockedObserver
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should hide banners on mount', () => {
        document.body.innerHTML = `
            <div class="ui-banner-banner" style="display: block;"></div>
            <div class="ui-banner-banner" style="display: block;"></div>
        `

        renderHook(() => useHideBanners())

        const banners = document.querySelectorAll('.ui-banner-banner')
        banners.forEach((banner) => {
            expect((banner as HTMLElement).style.display).toBe('none')
        })
    })

    it('should reactivate banners on unmount', () => {
        document.body.innerHTML = `
            <div class="ui-banner-banner" style="display: block;"></div>
            <div class="ui-banner-banner" style="display: block;"></div>
        `

        const { unmount } = renderHook(() => useHideBanners())

        unmount()

        const banners = document.querySelectorAll('.ui-banner-banner')
        banners.forEach((banner) => {
            expect((banner as HTMLElement).style.display).toBe('block')
        })
    })

    it('should observe mutations and hide new banners', () => {
        document.body.innerHTML = `
            <div class="ui-banner-banner" style="display: block;"></div>
        `

        renderHook(() => useHideBanners())

        const newBanner = document.createElement('div')
        newBanner.className = 'ui-banner-banner'
        newBanner.style.display = 'block'
        document.body.appendChild(newBanner)

        // Trigger the MutationObserver callback
        mockedObserver.mock.results[0].value.takeRecords()

        expect(newBanner.style.display).toBe('none')
    })
})
