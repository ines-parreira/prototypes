import { getDeviceType, isDesktopDevice } from '../device'

const getDeviceMock = vi.fn()

vi.mock('ua-parser-js', () => ({
    UAParser: class {
        getDevice = getDeviceMock
    },
}))

describe('device utils', () => {
    beforeEach(() => {
        getDeviceMock.mockReturnValue({ type: undefined })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('getDeviceType', () => {
        it('should return the device type', () => {
            getDeviceMock.mockReturnValueOnce({ type: 'mobile' })

            expect(getDeviceType()).toBe('mobile')
        })

        it("should return 'desktop' if the device type is not recognized", () => {
            getDeviceMock.mockReturnValueOnce({ type: undefined })

            expect(getDeviceType()).toBe('desktop')
        })
    })

    describe('isDesktopDevice', () => {
        it('should return true for desktop devices', () => {
            getDeviceMock.mockReturnValueOnce({ type: undefined })

            expect(isDesktopDevice()).toBe(true)
        })

        it('should return false for non-desktop devices', () => {
            getDeviceMock.mockReturnValueOnce({ type: 'mobile' })

            expect(isDesktopDevice()).toBe(false)
        })
    })
})
