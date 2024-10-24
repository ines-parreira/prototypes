import {Device} from '@twilio/voice-sdk'
import UAParser from 'ua-parser-js'

import {isDesktopDevice} from 'utils/device'

import * as utils from '../device'

jest.mock('ua-parser-js', () => {
    return {
        UAParser: jest.fn().mockImplementation(() => ({
            getDevice: jest.fn().mockReturnValue({type: undefined}),
        })),
    }
})

const UAParserSpy = jest.spyOn(UAParser, 'UAParser')

describe('device utils', () => {
    describe('getDeviceType', () => {
        it('should return the device type', () => {
            ;(UAParserSpy as jest.SpyInstance).mockImplementationOnce(() => ({
                getDevice: jest.fn().mockReturnValue({type: 'mobile'}),
            }))

            const result = utils.getDeviceType()
            expect(result).toBe('mobile')
        })

        it(`should return 'desktop' if the device type is not recognized`, () => {
            ;(UAParserSpy as jest.SpyInstance).mockImplementationOnce(() => ({
                getDevice: jest.fn().mockReturnValue({type: undefined}),
            }))

            const result = utils.getDeviceType()
            expect(result).toBe('desktop')
        })
    })

    describe('isDesktopDevice', () => {
        it('should return true for desktop devices', () => {
            jest.spyOn(utils, 'getDeviceType').mockReturnValueOnce('desktop')
            const result = utils.isDesktopDevice()

            expect(result).toBe(true)
        })

        it('should return false for non-desktop devices', () => {
            jest.spyOn(utils, 'getDeviceType').mockReturnValueOnce('mobile')
            const result = isDesktopDevice()

            expect(result).toBe(false)
        })
    })

    describe('isDeviceReady', () => {
        it('should return true if the device is registered', () => {
            const device = {
                state: Device.State.Registered,
            } as Device

            expect(utils.isDeviceReady(device)).toBe(true)
        })

        it.each([
            Device.State.Unregistered,
            Device.State.Registering,
            Device.State.Destroyed,
            Device.State.Unregistered,
        ])('should return false if the device is not registered', (state) => {
            const device = {
                state: state,
            } as Device

            expect(utils.isDeviceReady(device)).toBe(false)
        })

        it('should return false if the device is null', () => {
            expect(utils.isDeviceReady(null)).toBe(false)
        })
    })
})
