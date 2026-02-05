import { STATUSES } from 'reapop'

import theme, { createNotificationsTheme } from '../Notifications'

describe('createNotificationsTheme', () => {
    describe('with legacy theme (isAxiom: false)', () => {
        const legacyTheme = createNotificationsTheme(false)

        it('should return a theme object with legacy styles', () => {
            expect(legacyTheme).toBeDefined()
            expect(legacyTheme.container).toBeDefined()
            expect(legacyTheme.notification).toBeDefined()
        })

        it('should use legacy colors for notification borders', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const notificationStyles = legacyTheme.notification(
                mockNotification as any,
            )

            expect(notificationStyles.borderColor).toBe('var(--main-primary)')
        })

        it('should use legacy background color', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const notificationStyles = legacyTheme.notification(
                mockNotification as any,
            )

            expect(notificationStyles.backgroundColor).toBe(
                'var(--neutral-grey-0)',
            )
        })

        it('should use legacy border radius', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const notificationStyles = legacyTheme.notification(
                mockNotification as any,
            )

            expect(notificationStyles.borderRadius).toBe(4)
        })

        it('should use legacy title color', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const titleStyles = legacyTheme.notificationTitle(
                mockNotification as any,
            )

            expect(titleStyles.color).toBe('var(--neutral-grey-6)')
        })

        it('should use legacy message color', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const messageStyles = legacyTheme.notificationMessage(
                mockNotification as any,
            )

            expect(messageStyles.color).toBe('var(--neutral-grey-6)')
        })

        it('should use legacy dismiss icon color', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const dismissIconStyles = legacyTheme.notificationDismissIcon(
                mockNotification as any,
            )

            expect(dismissIconStyles.color).toBe('var(--neutral-grey-4)')
        })

        it('should use correct legacy colors for each status', () => {
            const statuses = [
                { status: STATUSES.info, color: 'var(--main-primary)' },
                { status: STATUSES.success, color: 'var(--feedback-success)' },
                { status: STATUSES.error, color: 'var(--feedback-error)' },
                { status: STATUSES.warning, color: 'var(--feedback-warning)' },
                { status: STATUSES.loading, color: 'var(--neutral-grey-4)' },
            ]

            statuses.forEach(({ status, color }) => {
                const mockNotification = {
                    id: '1',
                    status,
                    title: 'Test',
                    message: 'Test message',
                    buttons: [],
                }

                const notificationStyles = legacyTheme.notification(
                    mockNotification as any,
                )

                expect(notificationStyles.borderColor).toBe(color)
            })
        })

        it('should style primary buttons with legacy styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [
                    { primary: true, name: 'Confirm', onClick: () => {} },
                ],
            }

            const buttonStyles = legacyTheme.notificationButton(
                mockNotification as any,
                0,
                { isHovered: false, isActive: false },
            )

            expect(buttonStyles.background).toBe('var(--main-primary)')
            expect(buttonStyles.borderColor).toBe('var(--main-primary-3)')
            expect(buttonStyles.color).toBe('var(--neutral-grey-0)')
        })

        it('should style primary buttons on hover with legacy styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [
                    { primary: true, name: 'Confirm', onClick: () => {} },
                ],
            }

            const buttonStyles = legacyTheme.notificationButton(
                mockNotification as any,
                0,
                { isHovered: true, isActive: false },
            )

            expect(buttonStyles.background).toBe('var(--main-primary-2)')
            expect(buttonStyles.borderColor).toBe('var(--main-primary)')
        })

        it('should style secondary buttons with legacy color', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [
                    { primary: false, name: 'Cancel', onClick: () => {} },
                ],
            }

            const buttonStyles = legacyTheme.notificationButton(
                mockNotification as any,
                0,
                { isHovered: false, isActive: false },
            )

            expect(buttonStyles.color).toBe('var(--main-primary)')
            expect(buttonStyles.background).toBe('none')
        })

        it('should style primary buttons on active with legacy styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [
                    { primary: true, name: 'Confirm', onClick: () => {} },
                ],
            }

            const buttonStyles = legacyTheme.notificationButton(
                mockNotification as any,
                0,
                { isHovered: false, isActive: true },
            )

            expect(buttonStyles.background).toBe('var(--main-primary-3)')
            expect(buttonStyles.borderColor).toBe('var(--main-primary-4)')
        })

        it('should style secondary buttons on hover with legacy color', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [
                    { primary: false, name: 'Cancel', onClick: () => {} },
                ],
            }

            const buttonStyles = legacyTheme.notificationButton(
                mockNotification as any,
                0,
                { isHovered: true, isActive: false },
            )

            expect(buttonStyles.color).toBe('var(--main-primary-4)')
        })

        it('should configure notification icon styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const iconStyles = legacyTheme.notificationIcon(
                mockNotification as any,
            )

            expect(iconStyles.marginLeft).toBe(16)
        })

        it('should configure notification meta styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const metaStyles = legacyTheme.notificationMeta(
                mockNotification as any,
            )

            expect(metaStyles.padding).toBe('16px 8px 16px 16px')
        })

        it('should configure notification buttons container styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const buttonsStyles = legacyTheme.notificationButtons(
                mockNotification as any,
            )

            expect(buttonsStyles.order).toBe(1)
            expect(buttonsStyles.padding).toBe('4px 0')
            expect(buttonsStyles.display).toBe('flex')
        })

        it('should configure notification button text styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [
                    { primary: true, name: 'Confirm', onClick: () => {} },
                ],
            }

            const buttonTextStyles = legacyTheme.notificationButtonText(
                mockNotification as any,
                0,
                { isHovered: false, isActive: false },
            )

            expect(buttonTextStyles.fontSize).toBe(12)
            expect(buttonTextStyles.fontWeight).toBe(500)
            expect(buttonTextStyles.lineHeight).toBe('20px')
            expect(buttonTextStyles.verticalAlign).toBe('middle')
        })

        it('should configure notification dimensions and layout', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const notificationStyles = legacyTheme.notification(
                mockNotification as any,
            )

            expect(notificationStyles.width).toBe('auto')
            expect(notificationStyles.display).toBe('inline-flex')
            expect(notificationStyles.alignItems).toBe('center')
            expect(notificationStyles.border).toBe('1px solid')
            expect(notificationStyles.paddingRight).toBe(16)
            expect(notificationStyles.zIndex).toBe(1100)
            expect(notificationStyles.pointerEvents).toBe('auto')
        })

        it('should configure title typography styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const titleStyles = legacyTheme.notificationTitle(
                mockNotification as any,
            )

            expect(titleStyles.marginBottom).toBe(4)
            expect(titleStyles.fontWeight).toBe(600)
            expect(titleStyles.lineHeight).toBe('20px')
        })

        it('should configure message typography styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const messageStyles = legacyTheme.notificationMessage(
                mockNotification as any,
            )

            expect(messageStyles.fontSize).toBe(14)
            expect(messageStyles.lineHeight).toBe('20px')
            expect(messageStyles.letterSpacing).toBe('-0.01em')
        })

        it('should configure dismiss icon layout styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const dismissIconStyles = legacyTheme.notificationDismissIcon(
                mockNotification as any,
            )

            expect(dismissIconStyles.order).toBe(2)
            expect(dismissIconStyles.margin).toBe('0px 8px')
            expect(dismissIconStyles.height).toBe(11)
            expect(dismissIconStyles.width).toBe(11)
        })
    })

    describe('with Axiom theme (isAxiom: true)', () => {
        const axiomTheme = createNotificationsTheme(true)

        it('should return a theme object with Axiom styles', () => {
            expect(axiomTheme).toBeDefined()
            expect(axiomTheme.container).toBeDefined()
            expect(axiomTheme.notification).toBeDefined()
        })

        it('should use Axiom colors for notification borders', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const notificationStyles = axiomTheme.notification(
                mockNotification as any,
            )

            expect(notificationStyles.borderColor).toBe(
                'var(--border-accent-default)',
            )
        })

        it('should use Axiom background color', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const notificationStyles = axiomTheme.notification(
                mockNotification as any,
            )

            expect(notificationStyles.backgroundColor).toBe(
                'var(--elevation-neutral-default)',
            )
        })

        it('should use Axiom border radius', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const notificationStyles = axiomTheme.notification(
                mockNotification as any,
            )

            expect(notificationStyles.borderRadius).toBe('var(--spacing-xs)')
        })

        it('should use Axiom title color', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const titleStyles = axiomTheme.notificationTitle(
                mockNotification as any,
            )

            expect(titleStyles.color).toBe('var(--content-neutral-default)')
        })

        it('should use Axiom message color', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const messageStyles = axiomTheme.notificationMessage(
                mockNotification as any,
            )

            expect(messageStyles.color).toBe('var(--content-neutral-default)')
        })

        it('should use Axiom dismiss icon color', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const dismissIconStyles = axiomTheme.notificationDismissIcon(
                mockNotification as any,
            )

            expect(dismissIconStyles.color).toBe(
                'var(--content-neutral-secondary)',
            )
        })

        it('should use correct Axiom colors for each status', () => {
            const statuses = [
                {
                    status: STATUSES.info,
                    color: 'var(--border-accent-default)',
                },
                {
                    status: STATUSES.success,
                    color: 'var(--border-success-primary)',
                },
                {
                    status: STATUSES.error,
                    color: 'var(--border-error-primary)',
                },
                {
                    status: STATUSES.warning,
                    color: 'var(--border-warning-default)',
                },
                {
                    status: STATUSES.loading,
                    color: 'var(--border-neutral-tertiary)',
                },
            ]

            statuses.forEach(({ status, color }) => {
                const mockNotification = {
                    id: '1',
                    status,
                    title: 'Test',
                    message: 'Test message',
                    buttons: [],
                }

                const notificationStyles = axiomTheme.notification(
                    mockNotification as any,
                )

                expect(notificationStyles.borderColor).toBe(color)
            })
        })

        it('should style primary buttons with Axiom styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [
                    { primary: true, name: 'Confirm', onClick: () => {} },
                ],
            }

            const buttonStyles = axiomTheme.notificationButton(
                mockNotification as any,
                0,
                { isHovered: false, isActive: false },
            )

            expect(buttonStyles.background).toBe(
                'var(--surface-button-secondary)',
            )
            expect(buttonStyles.borderColor).toBe(
                'var(--border-neutral-tertiary)',
            )
            expect(buttonStyles.color).toBe('var(--content-neutral-default)')
            expect(buttonStyles.borderRadius).toBe('var(--spacing-xs)')
        })

        it('should style secondary buttons with Axiom neutral color', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [
                    { primary: false, name: 'Cancel', onClick: () => {} },
                ],
            }

            const buttonStyles = axiomTheme.notificationButton(
                mockNotification as any,
                0,
                { isHovered: false, isActive: false },
            )

            expect(buttonStyles.color).toBe('var(--content-neutral-default)')
            expect(buttonStyles.background).toBe('none')
        })

        it('should style secondary buttons on hover with Axiom neutral color', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [
                    { primary: false, name: 'Cancel', onClick: () => {} },
                ],
            }

            const buttonStyles = axiomTheme.notificationButton(
                mockNotification as any,
                0,
                { isHovered: true, isActive: false },
            )

            expect(buttonStyles.color).toBe('var(--content-neutral-default)')
        })

        it('should configure notification icon styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const iconStyles = axiomTheme.notificationIcon(
                mockNotification as any,
            )

            expect(iconStyles.marginLeft).toBe(16)
        })

        it('should configure notification meta styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const metaStyles = axiomTheme.notificationMeta(
                mockNotification as any,
            )

            expect(metaStyles.padding).toBe('16px 8px 16px 16px')
        })

        it('should configure notification buttons container styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const buttonsStyles = axiomTheme.notificationButtons(
                mockNotification as any,
            )

            expect(buttonsStyles.order).toBe(1)
            expect(buttonsStyles.padding).toBe('4px 0')
            expect(buttonsStyles.display).toBe('flex')
        })

        it('should configure notification button text styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [
                    { primary: true, name: 'Confirm', onClick: () => {} },
                ],
            }

            const buttonTextStyles = axiomTheme.notificationButtonText(
                mockNotification as any,
                0,
                { isHovered: false, isActive: false },
            )

            expect(buttonTextStyles.fontSize).toBe(12)
            expect(buttonTextStyles.fontWeight).toBe(500)
            expect(buttonTextStyles.lineHeight).toBe('20px')
            expect(buttonTextStyles.verticalAlign).toBe('middle')
        })

        it('should configure notification dimensions and layout', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const notificationStyles = axiomTheme.notification(
                mockNotification as any,
            )

            expect(notificationStyles.width).toBe('auto')
            expect(notificationStyles.display).toBe('inline-flex')
            expect(notificationStyles.alignItems).toBe('center')
            expect(notificationStyles.border).toBe('1px solid')
            expect(notificationStyles.paddingRight).toBe(16)
            expect(notificationStyles.zIndex).toBe(1100)
            expect(notificationStyles.pointerEvents).toBe('auto')
        })

        it('should configure title typography styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const titleStyles = axiomTheme.notificationTitle(
                mockNotification as any,
            )

            expect(titleStyles.marginBottom).toBe(4)
            expect(titleStyles.fontWeight).toBe(600)
            expect(titleStyles.lineHeight).toBe('20px')
        })

        it('should configure message typography styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const messageStyles = axiomTheme.notificationMessage(
                mockNotification as any,
            )

            expect(messageStyles.fontSize).toBe(14)
            expect(messageStyles.lineHeight).toBe('20px')
            expect(messageStyles.letterSpacing).toBe('-0.01em')
        })

        it('should configure dismiss icon layout styles', () => {
            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const dismissIconStyles = axiomTheme.notificationDismissIcon(
                mockNotification as any,
            )

            expect(dismissIconStyles.order).toBe(2)
            expect(dismissIconStyles.margin).toBe('0px 8px')
            expect(dismissIconStyles.height).toBe(11)
            expect(dismissIconStyles.width).toBe(11)
        })
    })

    describe('default export', () => {
        it('should export legacy theme by default', () => {
            expect(theme).toBeDefined()

            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const notificationStyles = theme.notification(
                mockNotification as any,
            )

            expect(notificationStyles.backgroundColor).toBe(
                'var(--neutral-grey-0)',
            )
            expect(notificationStyles.borderRadius).toBe(4)
        })
    })

    describe('container styles', () => {
        it('should configure container with flex layout', () => {
            const legacyTheme = createNotificationsTheme(false)
            const containerStyles = legacyTheme.container('top-right', false)

            expect(containerStyles.display).toBe('flex')
            expect(containerStyles.flexDirection).toBe('column')
            expect(containerStyles.alignItems).toBe('flex-end')
        })
    })

    describe('notification dimensions', () => {
        it('should set consistent notification dimensions for both themes', () => {
            const legacyTheme = createNotificationsTheme(false)
            const axiomTheme = createNotificationsTheme(true)

            const mockNotification = {
                id: '1',
                status: STATUSES.info,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const legacyStyles = legacyTheme.notification(
                mockNotification as any,
            )
            const axiomStyles = axiomTheme.notification(mockNotification as any)

            expect(legacyStyles.minWidth).toBe(320)
            expect(legacyStyles.maxWidth).toBe(680)
            expect(legacyStyles.minHeight).toBe(52)
            expect(legacyStyles.borderLeftWidth).toBe(4)

            expect(axiomStyles.minWidth).toBe(320)
            expect(axiomStyles.maxWidth).toBe(680)
            expect(axiomStyles.minHeight).toBe(52)
            expect(axiomStyles.borderLeftWidth).toBe(4)
        })
    })

    describe('fallback behavior', () => {
        it('should fallback to info color for unknown status in legacy theme', () => {
            const legacyTheme = createNotificationsTheme(false)
            const mockNotification = {
                id: '1',
                status: 'unknown-status' as any,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const notificationStyles = legacyTheme.notification(
                mockNotification as any,
            )

            expect(notificationStyles.borderColor).toBe('var(--main-primary)')
        })

        it('should fallback to info color for unknown status in Axiom theme', () => {
            const axiomTheme = createNotificationsTheme(true)
            const mockNotification = {
                id: '1',
                status: 'unknown-status' as any,
                title: 'Test',
                message: 'Test message',
                buttons: [],
            }

            const notificationStyles = axiomTheme.notification(
                mockNotification as any,
            )

            expect(notificationStyles.borderColor).toBe(
                'var(--border-accent-default)',
            )
        })
    })
})
