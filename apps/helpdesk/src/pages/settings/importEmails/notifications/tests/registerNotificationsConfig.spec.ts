import { notifications } from 'common/notifications/data'

import ImportEmailFailedNotification from '../components/ImportEmailFailedNotification'
import ImportEmailSuccessNotification from '../components/ImportEmailSuccessNotification'

import '../registerNotificationsConfig'

describe('registerNotificationsConfig', () => {
    describe('import.failed notification', () => {
        it('should register with correct configuration', () => {
            expect(notifications['import.failed']).toEqual({
                type: 'import.failed',
                component: ImportEmailFailedNotification,
                getDesktopNotification: expect.any(Function),
                workflow: 'import-failed',
                settings: {
                    type: 'ticket-updates',
                    label: 'Import email import failed',
                },
            })
        })

        it('should return correct desktop notification', () => {
            const getDesktopNotification =
                notifications['import.failed']?.getDesktopNotification
            expect(getDesktopNotification?.({} as any)).toEqual({
                title: 'Email import failed',
            })
        })

        it('should use ImportEmailFailedNotification component', () => {
            expect(notifications['import.failed']?.component).toBe(
                ImportEmailFailedNotification,
            )
        })

        it('should have import-failed workflow', () => {
            expect(notifications['import.failed']?.workflow).toBe(
                'import-failed',
            )
        })

        it('should have correct settings label', () => {
            expect(notifications['import.failed']?.settings?.label).toBe(
                'Import email import failed',
            )
        })
    })

    describe('import.completed notification', () => {
        it('should register with current configuration', () => {
            expect(notifications['import.completed']).toEqual({
                type: 'import.completed',
                component: ImportEmailSuccessNotification,
                workflow: 'import-completed',
                settings: {
                    type: 'ticket-updates',
                    label: 'Import email import success',
                },
            })
        })

        it('should use ImportEmailFailedNotification component', () => {
            expect(notifications['import.completed']?.component).toBe(
                ImportEmailSuccessNotification,
            )
        })

        it('should use import-failed workflow', () => {
            expect(notifications['import.completed']?.workflow).toBe(
                'import-completed',
            )
        })

        it('should have Message failed settings label', () => {
            expect(notifications['import.completed']?.settings?.label).toBe(
                'Import email import success',
            )
        })
    })

    describe('notification types', () => {
        it('should register both import.failed and import.completed types', () => {
            expect(notifications['import.failed']).toBeDefined()
            expect(notifications['import.completed']).toBeDefined()
        })

        it('should have different notification types', () => {
            expect(notifications['import.failed']?.type).toBe('import.failed')
            expect(notifications['import.completed']?.type).toBe(
                'import.completed',
            )
        })

        it('should both use ticket-updates settings type', () => {
            expect(notifications['import.failed']?.settings?.type).toBe(
                'ticket-updates',
            )
            expect(notifications['import.completed']?.settings?.type).toBe(
                'ticket-updates',
            )
        })
    })
})
