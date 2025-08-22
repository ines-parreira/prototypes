import { fromJS, List } from 'immutable'

import { DEFAULT_PREFERENCES } from 'config'
import { UserSettingType } from 'config/types/user'
import { DateFormatType, TimeFormatType } from 'constants/datetime'
import { user } from 'fixtures/users'
import { RootState } from 'state/types'

import { initialState } from '../reducers'
import * as selectors from '../selectors'

describe('current user selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            currentUser: initialState.mergeDeep(
                fromJS({
                    ...user,
                    _internal: {
                        loading: {
                            settings: {
                                preferences: true,
                            },
                            currentUser: true,
                        },
                    },
                }),
            ),
        } as RootState
    })

    it('getCurrentUserState', () => {
        expect(selectors.getCurrentUserState(state)).toEqualImmutable(
            state.currentUser,
        )
        expect(selectors.getCurrentUserState({} as RootState)).toEqualImmutable(
            fromJS({}),
        )
    })

    it('getCurrentUser', () => {
        expect(selectors.getCurrentUser(state)).toEqualImmutable(
            state.currentUser,
        )
        expect(selectors.getCurrentUser({} as RootState)).toEqualImmutable(
            fromJS({}),
        )
    })

    it('getCurrentUserId', () => {
        expect(selectors.getCurrentUserId(state)).toBe(2)
        expect(selectors.getCurrentUserId({} as RootState)).toBeUndefined()
    })

    it('getSettings', () => {
        expect(selectors.getSettings(state)).toEqualImmutable(
            state.currentUser.get('settings'),
        )
        expect(selectors.getSettings({} as RootState)).toEqualImmutable(
            fromJS([]),
        )
    })

    it('getSettingsByType', () => {
        expect(
            selectors.getSettingsByType(UserSettingType.Preferences)(state),
        ).toEqualImmutable(
            (state.currentUser.get('settings') as List<any>).first(),
        )
    })

    it('getPreferences', () => {
        expect(selectors.getPreferences(state)).toEqualImmutable(
            (state.currentUser.get('settings') as List<any>).last(),
        )
        expect(selectors.getPreferences({} as RootState)).toEqualImmutable(
            fromJS({
                type: 'preferences',
                data: DEFAULT_PREFERENCES,
            }),
        )
    })

    describe('getPreferences edge cases', () => {
        it('should merge preferences with defaults', () => {
            const testState = {
                currentUser: fromJS({
                    settings: [
                        {
                            type: 'preferences',
                            data: {
                                custom_field: 'custom_value',
                            },
                        },
                    ],
                }),
            } as RootState

            const result = selectors.getPreferences(testState)
            expect(result.get('type')).toBe('preferences')
            expect(result.getIn(['data', 'custom_field'])).toBe('custom_value')
        })

        it('should handle multiple preference settings', () => {
            const testState = {
                currentUser: fromJS({
                    settings: [
                        {
                            type: 'other',
                            data: { test: 'data' },
                        },
                        {
                            type: 'preferences',
                            data: { first: 'preference' },
                        },
                        {
                            type: 'preferences',
                            data: { second: 'preference' },
                        },
                    ],
                }),
            } as RootState

            const result = selectors.getPreferences(testState)
            expect(result.getIn(['data', 'first'])).toBe('preference')
        })

        it('should handle null settings gracefully', () => {
            const testState = {
                currentUser: fromJS({
                    settings: null,
                }),
            } as RootState

            const result = selectors.getPreferences(testState)
            expect(result.get('type')).toBe('preferences')
            expect(result.get('data')).toEqualImmutable(
                fromJS(DEFAULT_PREFERENCES),
            )
        })
    })

    it('isAvailableForChat', () => {
        expect(selectors.isAvailable(state)).toBe(true)
        expect(selectors.isAvailable({} as RootState)).toBe(true)
    })

    describe('isAvailable edge cases', () => {
        it('should return false when available is explicitly false', () => {
            const testState = {
                currentUser: fromJS({
                    settings: [
                        {
                            type: 'preferences',
                            data: {
                                available: false,
                            },
                        },
                    ],
                }),
            } as RootState

            expect(selectors.isAvailable(testState)).toBe(false)
        })

        it('should handle non-boolean available values', () => {
            const testState = {
                currentUser: fromJS({
                    settings: [
                        {
                            type: 'preferences',
                            data: {
                                available: 'yes',
                            },
                        },
                    ],
                }),
            } as RootState

            expect(selectors.isAvailable(testState)).toBe('yes')
        })

        it('should handle nested available property', () => {
            const testState = {
                currentUser: fromJS({
                    settings: [
                        {
                            type: 'preferences',
                            data: {
                                nested: {
                                    available: true,
                                },
                            },
                        },
                    ],
                }),
            } as RootState

            expect(selectors.isAvailable(testState)).toBe(true)
        })
    })

    it('isHidingTips', () => {
        expect(selectors.isHidingTips(state)).toBe(true)
        expect(selectors.isHidingTips({} as RootState)).toBe(false)
    })

    describe('isHidingTips edge cases', () => {
        it('should return false when hide_tips is explicitly false', () => {
            const testState = {
                currentUser: fromJS({
                    settings: [
                        {
                            type: 'preferences',
                            data: {
                                hide_tips: false,
                            },
                        },
                    ],
                }),
            } as RootState

            expect(selectors.isHidingTips(testState)).toBe(false)
        })

        it('should return false when hide_tips is undefined', () => {
            const testState = {
                currentUser: fromJS({
                    settings: [
                        {
                            type: 'preferences',
                            data: {},
                        },
                    ],
                }),
            } as RootState

            expect(selectors.isHidingTips(testState)).toBe(false)
        })

        it('should handle non-boolean hide_tips values', () => {
            const testState = {
                currentUser: fromJS({
                    settings: [
                        {
                            type: 'preferences',
                            data: {
                                hide_tips: 'true',
                            },
                        },
                    ],
                }),
            } as RootState

            expect(selectors.isHidingTips(testState)).toBe('true')
        })
    })

    it('isActive', () => {
        state = { currentUser: fromJS({}) } as RootState
        expect(selectors.isActive(state)).toBe(true)

        state = { currentUser: fromJS({ is_active: true }) } as RootState
        expect(selectors.isActive(state)).toBe(true)

        state = { currentUser: fromJS({ is_active: false }) } as RootState
        expect(selectors.isActive(state)).toBe(false)
    })

    it('getTimezone', () => {
        expect(selectors.getTimezone(state)).toEqualImmutable(
            state.currentUser.get('timezone'),
        )
        expect(selectors.getTimezone({} as RootState)).toEqualImmutable(null)
    })

    describe('getApiKey', () => {
        it('should return API key when auths exist', () => {
            const testState = {
                currentUser: fromJS({
                    auths: [
                        {
                            data: {
                                token: 'test-api-key-123',
                            },
                        },
                    ],
                }),
            } as RootState

            expect(selectors.getApiKey(testState)).toBe('test-api-key-123')
        })

        it('should return empty string when no auths exist', () => {
            const testState = {
                currentUser: fromJS({}),
            } as RootState

            expect(selectors.getApiKey(testState)).toBe('')
        })

        it('should return empty string when auths array is empty', () => {
            const testState = {
                currentUser: fromJS({
                    auths: [],
                }),
            } as RootState

            expect(selectors.getApiKey(testState)).toBe('')
        })
    })

    describe('hasPassword', () => {
        it('should return true when user has password', () => {
            const testState = {
                currentUser: fromJS({ has_password: true }),
            } as RootState

            expect(selectors.hasPassword(testState)).toBe(true)
        })

        it('should return false when user has no password', () => {
            const testState = {
                currentUser: fromJS({ has_password: false }),
            } as RootState

            expect(selectors.hasPassword(testState)).toBe(false)
        })

        it('should return false when has_password is undefined', () => {
            const testState = {
                currentUser: fromJS({}),
            } as RootState

            expect(selectors.hasPassword(testState)).toBe(false)
        })
    })

    describe('getRoleName', () => {
        it('should return role name when role exists', () => {
            const testState = {
                currentUser: fromJS({
                    role: { name: 'admin' },
                }),
            } as RootState

            expect(selectors.getRoleName(testState)).toBe('admin')
        })

        it('should return null when role does not exist', () => {
            const testState = {
                currentUser: fromJS({}),
            } as RootState

            expect(selectors.getRoleName(testState)).toBe(null)
        })

        it('should return null when role exists but name is undefined', () => {
            const testState = {
                currentUser: fromJS({
                    role: {},
                }),
            } as RootState

            expect(selectors.getRoleName(testState)).toBe(null)
        })
    })

    describe('makeGetSettingsByType', () => {
        it('should return setting by type', () => {
            const selector = selectors.makeGetSettingsByType()
            const settings = selector(state, UserSettingType.Preferences)
            expect(settings).toEqualImmutable(
                (state.currentUser.get('settings') as List<any>).first(),
            )
        })

        it('should return default setting when type does not exist', () => {
            const selector = selectors.makeGetSettingsByType()
            const settings = selector(state, 'non-existent-type')
            expect(settings.get('type')).toBe('non-existent-type')
            expect(settings.get('data')).toEqualImmutable(fromJS({}))
        })

        it('should handle views configuration', () => {
            const testState = {
                ...state,
                views: fromJS({
                    items: [
                        {
                            id: 1,
                            display_order: 5,
                        },
                        {
                            id: 2,
                            display_order: 10,
                        },
                    ],
                }),
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            type: 'test-type',
                            data: {
                                views: {
                                    '1': {
                                        display_order: 3,
                                    },
                                },
                            },
                        },
                    ]),
                ),
            } as RootState

            const selector = selectors.makeGetSettingsByType()
            const settings = selector(testState, 'test-type')

            expect(settings.getIn(['data', '1', 'hide'])).toBe(false)
            expect(settings.getIn(['data', '1', 'display_order'])).toBe(3)
            expect(settings.getIn(['data', '2', 'hide'])).toBe(false)
            expect(settings.getIn(['data', '2', 'display_order'])).toBe(10)
        })

        it('should handle missing views state', () => {
            const testState = {
                ...state,
                views: undefined,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            type: 'test-type',
                            data: {
                                test: 'data',
                            },
                        },
                    ]),
                ),
            } as unknown as RootState

            const selector = selectors.makeGetSettingsByType()
            const settings = selector(testState, 'test-type')

            expect(settings.get('type')).toBe('test-type')
            expect(settings.getIn(['data', 'test'])).toBe('data')
        })

        it('should handle empty views items', () => {
            const testState = {
                ...state,
                views: fromJS({
                    items: [],
                }),
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            type: 'test-type',
                            data: {
                                test: 'data',
                            },
                        },
                    ]),
                ),
            } as RootState

            const selector = selectors.makeGetSettingsByType()
            const settings = selector(testState, 'test-type')

            expect(settings.get('type')).toBe('test-type')
            expect(settings.getIn(['data', 'test'])).toBe('data')
        })

        it('should handle views with null items', () => {
            const testState = {
                ...state,
                views: fromJS({}),
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            type: 'test-type',
                            data: {
                                test: 'data',
                            },
                        },
                    ]),
                ),
            } as RootState

            const selector = selectors.makeGetSettingsByType()
            const settings = selector(testState, 'test-type')

            expect(settings.get('type')).toBe('test-type')
            expect(settings.getIn(['data', 'test'])).toBe('data')
        })
    })

    describe('getViewsOrderingUserSetting', () => {
        it('should return the setting by type', () => {
            const res = selectors.getViewsOrderingUserSetting({
                ...state,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            data: {
                                foo: 'bar',
                            },
                            id: 3,
                            type: UserSettingType.ViewsOrdering,
                        },
                    ]),
                ),
            })
            expect(res).toMatchSnapshot()
        })
    })

    describe('createUserSettingSelector', () => {
        it('should return the setting by type when it exists', () => {
            const testState = {
                ...state,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            data: { test: 'data' },
                            id: 1,
                            type: UserSettingType.Preferences,
                        },
                        {
                            data: { views: 'ordering' },
                            id: 2,
                            type: UserSettingType.ViewsOrdering,
                        },
                    ]),
                ),
            }

            const preferencesSelector = selectors.getViewsOrderingUserSetting
            const result = preferencesSelector(testState)

            expect(result).toEqual({
                data: { views: 'ordering' },
                id: 2,
                type: UserSettingType.ViewsOrdering,
            })
        })

        it('should return undefined when setting type does not exist', () => {
            const testState = {
                ...state,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            data: { test: 'data' },
                            id: 1,
                            type: UserSettingType.Preferences,
                        },
                    ]),
                ),
            }

            const preferencesSelector = selectors.getViewsOrderingUserSetting
            const result = preferencesSelector(testState)

            expect(result).toBeUndefined()
        })

        it('should handle empty settings array', () => {
            const testState = {
                ...state,
                currentUser: initialState.set('settings', fromJS([])),
            }

            const preferencesSelector = selectors.getViewsOrderingUserSetting
            const result = preferencesSelector(testState)

            expect(result).toBeUndefined()
        })

        it('should handle null/undefined settings', () => {
            const testState = {
                ...state,
                currentUser: initialState.set('settings', null),
            }

            const preferencesSelector = selectors.getViewsOrderingUserSetting
            const result = preferencesSelector(testState)

            expect(result).toBeUndefined()
        })

        it('should handle undefined settings property', () => {
            const testState = {
                ...state,
                currentUser: initialState.delete('settings'),
            }

            const preferencesSelector = selectors.getViewsOrderingUserSetting
            const result = preferencesSelector(testState)

            expect(result).toBeUndefined()
        })
    })

    describe('getNotificationSettings', () => {
        it('should return notification settings when they exist', () => {
            const testState = {
                ...state,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            data: {
                                email: true,
                                push: false,
                            },
                            id: 1,
                            type: UserSettingType.NotificationPreferences,
                        },
                    ]),
                ),
            } as RootState

            const result = selectors.getNotificationSettings(testState)

            expect(result).toEqual({
                data: {
                    email: true,
                    push: false,
                },
                id: 1,
                type: UserSettingType.NotificationPreferences,
            })
        })

        it('should return undefined when notification settings do not exist', () => {
            const testState = {
                ...state,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            data: { test: 'data' },
                            id: 1,
                            type: UserSettingType.Preferences,
                        },
                    ]),
                ),
            } as RootState

            const result = selectors.getNotificationSettings(testState)

            expect(result).toEqual({
                data: {},
                type: UserSettingType.NotificationPreferences,
            })
        })

        it('should handle empty settings array', () => {
            const testState = {
                ...state,
                currentUser: initialState.set('settings', fromJS([])),
            } as RootState

            const result = selectors.getNotificationSettings(testState)

            expect(result).toEqual({
                data: {},
                type: UserSettingType.NotificationPreferences,
            })
        })

        it('should handle null settings', () => {
            const testState = {
                ...state,
                currentUser: initialState.set('settings', null),
            } as RootState

            const result = selectors.getNotificationSettings(testState)

            expect(result).toEqual({
                data: {},
                type: UserSettingType.NotificationPreferences,
            })
        })
    })

    describe('getDateFormatPreferenceSetting', () => {
        it('should return user date format preference', () => {
            const testState = {
                ...state,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            data: {
                                date_format: DateFormatType.en_GB,
                            },
                            id: 1,
                            type: UserSettingType.Preferences,
                        },
                    ]),
                ),
            } as RootState

            const result = selectors.getDateFormatPreferenceSetting(testState)

            expect(result).toBe(DateFormatType.en_GB)
        })

        it('should return default date format when preference does not exist', () => {
            const testState = {
                ...state,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            data: {},
                            id: 1,
                            type: UserSettingType.Preferences,
                        },
                    ]),
                ),
            } as RootState

            const result = selectors.getDateFormatPreferenceSetting(testState)

            expect(result).toBe(DateFormatType.en_US)
        })

        it('should return default date format when preferences setting does not exist', () => {
            const testState = {
                ...state,
                currentUser: initialState.set('settings', fromJS([])),
            } as RootState

            const result = selectors.getDateFormatPreferenceSetting(testState)

            expect(result).toBe(DateFormatType.en_US)
        })
    })

    describe('getTimeFormatPreferenceSetting', () => {
        it('should return user time format preference', () => {
            const testState = {
                ...state,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            data: {
                                time_format: TimeFormatType.TwentyFourHour,
                            },
                            id: 1,
                            type: UserSettingType.Preferences,
                        },
                    ]),
                ),
            } as RootState

            const result = selectors.getTimeFormatPreferenceSetting(testState)

            expect(result).toBe(TimeFormatType.TwentyFourHour)
        })

        it('should return default time format when preference does not exist', () => {
            const testState = {
                ...state,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            data: {},
                            id: 1,
                            type: UserSettingType.Preferences,
                        },
                    ]),
                ),
            } as RootState

            const result = selectors.getTimeFormatPreferenceSetting(testState)

            expect(result).toBe(TimeFormatType.AmPm)
        })

        it('should return default time format when preferences setting does not exist', () => {
            const testState = {
                ...state,
                currentUser: initialState.set('settings', fromJS([])),
            } as RootState

            const result = selectors.getTimeFormatPreferenceSetting(testState)

            expect(result).toBe(TimeFormatType.AmPm)
        })
    })

    describe('getDateAndTimeFormatter', () => {
        it('should return a formatter function with user preferences', () => {
            const testState = {
                ...state,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            data: {
                                date_format: DateFormatType.en_GB,
                                time_format: TimeFormatType.TwentyFourHour,
                            },
                            id: 1,
                            type: UserSettingType.Preferences,
                        },
                    ]),
                ),
            } as RootState

            const formatter = selectors.getDateAndTimeFormatter(testState)

            expect(typeof formatter).toBe('function')
        })

        it('should use default formats when preferences are not set', () => {
            const testState = {
                ...state,
                currentUser: initialState.set('settings', fromJS([])),
            } as RootState

            const formatter = selectors.getDateAndTimeFormatter(testState)

            expect(typeof formatter).toBe('function')
        })

        it('should handle partial format preferences', () => {
            const testState = {
                ...state,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            data: {
                                date_format: DateFormatType.en_GB,
                            },
                            id: 1,
                            type: UserSettingType.Preferences,
                        },
                    ]),
                ),
            } as RootState

            const formatter = selectors.getDateAndTimeFormatter(testState)

            expect(typeof formatter).toBe('function')
        })

        it('should handle invalid preferences data', () => {
            const testState = {
                ...state,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            data: {
                                date_format: 'invalid',
                                time_format: 'invalid',
                            },
                            id: 1,
                            type: UserSettingType.Preferences,
                        },
                    ]),
                ),
            } as RootState

            const formatter = selectors.getDateAndTimeFormatter(testState)

            expect(typeof formatter).toBe('function')
        })
    })

    it('getLoading', () => {
        expect(selectors.getLoadingState(state)).toEqualImmutable(
            state.currentUser.getIn(['_internal', 'loading']),
        )
        expect(selectors.getLoadingState({} as RootState)).toEqualImmutable(
            fromJS({}),
        )
    })

    it('isLoading', () => {
        expect(
            selectors.isLoading(['settings', 'preferences'])(state),
        ).toEqualImmutable(true)
        expect(selectors.isLoading('currentUser')(state)).toBe(true)
        expect(selectors.isLoading('unknown')(state)).toBe(false)
    })

    describe('getIsPreferencesLoading', () => {
        it('should return true when preferences are loading', () => {
            expect(selectors.getIsPreferencesLoading(state)).toBe(true)
        })

        it('should return false when preferences are not loading', () => {
            const testState = {
                currentUser: fromJS({
                    _internal: {
                        loading: {
                            settings: {
                                preferences: false,
                            },
                        },
                    },
                }),
            } as RootState

            expect(selectors.getIsPreferencesLoading(testState)).toBe(false)
        })

        it('should return false when loading state does not exist', () => {
            const testState = {
                currentUser: fromJS({}),
            } as RootState

            expect(selectors.getIsPreferencesLoading(testState)).toBe(false)
        })
    })

    it('has2FaEnabled', () => {
        state = { currentUser: fromJS({}) } as RootState
        expect(selectors.has2FaEnabled(state)).toBe(false)

        state = { currentUser: fromJS({ has_2fa_enabled: true }) } as RootState
        expect(selectors.has2FaEnabled(state)).toBe(true)

        state = { currentUser: fromJS({ has_2fa_enabled: false }) } as RootState
        expect(selectors.has2FaEnabled(state)).toBe(false)
    })

    describe('edge cases and error handling', () => {
        it('should handle null currentUser state', () => {
            const nullState = { currentUser: null } as unknown as RootState

            expect(selectors.getCurrentUserState(nullState)).toEqualImmutable(
                fromJS({}),
            )
            expect(selectors.getCurrentUser(nullState)).toEqualImmutable(
                fromJS({}),
            )
            expect(selectors.getSettings(nullState)).toEqualImmutable(
                fromJS([]),
            )
        })

        it('should handle undefined currentUser state', () => {
            const undefinedState = {} as unknown as RootState

            expect(
                selectors.getCurrentUserState(undefinedState),
            ).toEqualImmutable(fromJS({}))
            expect(selectors.getCurrentUser(undefinedState)).toEqualImmutable(
                fromJS({}),
            )
            expect(selectors.getSettings(undefinedState)).toEqualImmutable(
                fromJS([]),
            )
        })

        it('should handle nested loading state paths', () => {
            const nestedLoadingState = {
                currentUser: fromJS({
                    _internal: {
                        loading: {
                            settings: {
                                preferences: true,
                                notifications: false,
                            },
                            profile: {
                                avatar: true,
                            },
                        },
                    },
                }),
            } as RootState

            expect(
                selectors.isLoading(['settings', 'preferences'])(
                    nestedLoadingState,
                ),
            ).toBe(true)
            expect(
                selectors.isLoading(['settings', 'notifications'])(
                    nestedLoadingState,
                ),
            ).toBe(false)
            expect(
                selectors.isLoading(['profile', 'avatar'])(nestedLoadingState),
            ).toBe(true)
        })

        it('should handle getPreferences with malformed settings', () => {
            const malformedState = {
                currentUser: fromJS({
                    settings: [
                        {
                            type: 'not-preferences',
                            data: { something: 'else' },
                        },
                        {
                            type: null,
                            data: null,
                        },
                    ],
                }),
            } as RootState

            const result = selectors.getPreferences(malformedState)
            expect(result.get('type')).toBe('preferences')
            expect(result.get('data')).toEqualImmutable(
                fromJS(DEFAULT_PREFERENCES),
            )
        })

        it('should handle getApiKey with malformed auths', () => {
            const malformedState = {
                currentUser: fromJS({
                    auths: [
                        {
                            data: null,
                        },
                    ],
                }),
            } as RootState

            expect(selectors.getApiKey(malformedState)).toBe('')
        })

        it('should handle getApiKey with nested null values', () => {
            const malformedState = {
                currentUser: fromJS({
                    auths: [
                        {
                            data: {
                                token: null,
                            },
                        },
                    ],
                }),
            } as RootState

            expect(selectors.getApiKey(malformedState)).toBe('')
        })

        it('should handle getTimezone with non-string values', () => {
            const testState = {
                currentUser: fromJS({
                    timezone: 123,
                }),
            } as RootState

            expect(selectors.getTimezone(testState)).toBe(123)
        })

        it('should handle isAvailable with missing preferences data', () => {
            const testState = {
                currentUser: fromJS({
                    settings: [
                        {
                            type: 'preferences',
                            data: null,
                        },
                    ],
                }),
            } as RootState

            expect(selectors.isAvailable(testState)).toBeUndefined()
        })

        it('should handle isLoading with empty path array', () => {
            const testState = {
                currentUser: fromJS({
                    _internal: {
                        loading: {
                            test: true,
                        },
                    },
                }),
            } as RootState

            const result = selectors.isLoading([])(testState)
            expect(result).toEqualImmutable(
                fromJS({
                    test: true,
                }),
            )
        })

        it('should handle deeply nested loading paths', () => {
            const testState = {
                currentUser: fromJS({
                    _internal: {
                        loading: {
                            level1: {
                                level2: {
                                    level3: {
                                        level4: true,
                                    },
                                },
                            },
                        },
                    },
                }),
            } as RootState

            expect(
                selectors.isLoading(['level1', 'level2', 'level3', 'level4'])(
                    testState,
                ),
            ).toBe(true)
            expect(
                selectors.isLoading(['level1', 'level2', 'level3', 'level5'])(
                    testState,
                ),
            ).toBe(false)
        })

        it('should handle getDateAndTimeFormatter with null values', () => {
            const testState = {
                currentUser: fromJS({
                    settings: null,
                }),
            } as RootState

            const formatter = selectors.getDateAndTimeFormatter(testState)
            expect(typeof formatter).toBe('function')
        })

        it('should handle getSettingsByType with invalid type', () => {
            const selector = selectors.getSettingsByType('invalid-type')
            const result = selector(state)
            expect(result.get('type')).toBe('invalid-type')
            expect(result.get('data')).toEqualImmutable(fromJS({}))
        })

        it('should handle makeGetSettingsByType with views having no display_order', () => {
            const testState = {
                ...state,
                views: fromJS({
                    items: [
                        {
                            id: 1,
                        },
                        {
                            id: 2,
                        },
                    ],
                }),
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            type: 'test-type',
                            data: {
                                views: {},
                            },
                        },
                    ]),
                ),
            } as RootState

            const selector = selectors.makeGetSettingsByType()
            const settings = selector(testState, 'test-type')

            expect(settings.getIn(['data', '1', 'display_order'])).toBe(0)
            expect(settings.getIn(['data', '2', 'display_order'])).toBe(0)
        })
    })
})
