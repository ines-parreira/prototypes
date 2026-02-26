import type { GuidanceArticle } from 'pages/aiAgent/types'

import { guidanceReducer } from '../KnowledgeEditorGuidanceReducer'
import type { GuidanceState } from '../types'

describe('guidanceReducer', () => {
    const mockGuidance: GuidanceArticle = {
        id: 123,
        title: 'Test Title',
        content: 'Test Content',
        locale: 'en-US',
        visibility: 'PUBLIC',
        createdDatetime: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z',
        templateKey: null,
        isCurrent: false,
        draftVersionId: 1,
        publishedVersionId: null,
    }

    const initialState: GuidanceState = {
        guidanceMode: 'edit',
        isFullscreen: false,
        isDetailsView: true,
        title: 'Test Title',
        content: 'Test Content',
        visibility: true,
        savedSnapshot: { title: 'Test Title', content: 'Test Content' },
        guidance: mockGuidance,
        isAutoSaving: false,
        hasAutoSavedInSession: false,
        autoSaveError: false,
        isFromTemplate: false,
        hasTemplateChanges: false,
        versionStatus: 'latest_draft',
        activeModal: null,
        isUpdating: false,
        historicalVersion: null,
        comparisonVersion: null,
    }

    describe('SET_MODE', () => {
        it('should update guidanceMode to create', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_MODE',
                payload: 'create',
            })

            expect(result.guidanceMode).toBe('create')
            expect(result.title).toBe(initialState.title)
        })

        it('should update guidanceMode to read', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_MODE',
                payload: 'read',
            })

            expect(result.guidanceMode).toBe('read')
        })

        it('should update guidanceMode to edit', () => {
            const stateInRead = {
                ...initialState,
                guidanceMode: 'read' as const,
            }
            const result = guidanceReducer(stateInRead, {
                type: 'SET_MODE',
                payload: 'edit',
            })

            expect(result.guidanceMode).toBe('edit')
        })

        it('should reset hasAutoSavedInSession to false when switching to read mode', () => {
            const stateWithAutoSaved = {
                ...initialState,
                guidanceMode: 'edit' as const,
                hasAutoSavedInSession: true,
            }
            const result = guidanceReducer(stateWithAutoSaved, {
                type: 'SET_MODE',
                payload: 'read',
            })

            expect(result.hasAutoSavedInSession).toBe(false)
        })

        it('should preserve hasAutoSavedInSession when switching to edit mode', () => {
            const stateWithAutoSaved = {
                ...initialState,
                guidanceMode: 'read' as const,
                hasAutoSavedInSession: true,
            }
            const result = guidanceReducer(stateWithAutoSaved, {
                type: 'SET_MODE',
                payload: 'edit',
            })

            expect(result.hasAutoSavedInSession).toBe(true)
        })

        it('should update guidanceMode to diff', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_MODE',
                payload: 'diff',
            })

            expect(result.guidanceMode).toBe('diff')
        })

        it('should reset hasAutoSavedInSession to false when switching to diff mode', () => {
            const stateWithAutoSaved = {
                ...initialState,
                guidanceMode: 'edit' as const,
                hasAutoSavedInSession: true,
            }
            const result = guidanceReducer(stateWithAutoSaved, {
                type: 'SET_MODE',
                payload: 'diff',
            })

            expect(result.hasAutoSavedInSession).toBe(false)
        })

        it('should preserve comparisonVersion when switching to diff mode', () => {
            const stateWithComparison = {
                ...initialState,
                comparisonVersion: {
                    title: 'Previous title',
                    content: 'Previous content',
                },
            }

            const result = guidanceReducer(stateWithComparison, {
                type: 'SET_MODE',
                payload: 'diff',
            })

            expect(result.comparisonVersion).toEqual({
                title: 'Previous title',
                content: 'Previous content',
            })
        })

        it('should clear comparisonVersion outside diff mode', () => {
            const stateWithComparison = {
                ...initialState,
                guidanceMode: 'diff' as const,
                comparisonVersion: {
                    title: 'Previous title',
                    content: 'Previous content',
                },
            }

            const result = guidanceReducer(stateWithComparison, {
                type: 'SET_MODE',
                payload: 'edit',
            })

            expect(result.comparisonVersion).toBeNull()
        })

        it('should preserve hasAutoSavedInSession when switching to create mode', () => {
            const stateWithAutoSaved = {
                ...initialState,
                guidanceMode: 'edit' as const,
                hasAutoSavedInSession: true,
            }
            const result = guidanceReducer(stateWithAutoSaved, {
                type: 'SET_MODE',
                payload: 'create',
            })

            expect(result.hasAutoSavedInSession).toBe(true)
        })
    })

    describe('SET_FULLSCREEN', () => {
        it('should set isFullscreen to true', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_FULLSCREEN',
                payload: true,
            })

            expect(result.isFullscreen).toBe(true)
        })

        it('should set isFullscreen to false', () => {
            const stateFullscreen = { ...initialState, isFullscreen: true }
            const result = guidanceReducer(stateFullscreen, {
                type: 'SET_FULLSCREEN',
                payload: false,
            })

            expect(result.isFullscreen).toBe(false)
        })
    })

    describe('TOGGLE_FULLSCREEN', () => {
        it('should toggle isFullscreen from false to true', () => {
            const result = guidanceReducer(initialState, {
                type: 'TOGGLE_FULLSCREEN',
            })

            expect(result.isFullscreen).toBe(true)
        })

        it('should toggle isFullscreen from true to false', () => {
            const stateFullscreen = { ...initialState, isFullscreen: true }
            const result = guidanceReducer(stateFullscreen, {
                type: 'TOGGLE_FULLSCREEN',
            })

            expect(result.isFullscreen).toBe(false)
        })
    })

    describe('SET_DETAILS_VIEW', () => {
        it('should set isDetailsView to true', () => {
            const stateNoDetails = { ...initialState, isDetailsView: false }
            const result = guidanceReducer(stateNoDetails, {
                type: 'SET_DETAILS_VIEW',
                payload: true,
            })

            expect(result.isDetailsView).toBe(true)
        })

        it('should set isDetailsView to false', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_DETAILS_VIEW',
                payload: false,
            })

            expect(result.isDetailsView).toBe(false)
        })
    })

    describe('TOGGLE_DETAILS_VIEW', () => {
        it('should toggle isDetailsView from true to false', () => {
            const result = guidanceReducer(initialState, {
                type: 'TOGGLE_DETAILS_VIEW',
            })

            expect(result.isDetailsView).toBe(false)
        })

        it('should toggle isDetailsView from false to true', () => {
            const stateNoDetails = { ...initialState, isDetailsView: false }
            const result = guidanceReducer(stateNoDetails, {
                type: 'TOGGLE_DETAILS_VIEW',
            })

            expect(result.isDetailsView).toBe(true)
        })
    })

    describe('SET_TITLE', () => {
        it('should update title', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_TITLE',
                payload: 'New Title',
            })

            expect(result.title).toBe('New Title')
        })

        it('should not update hasTemplateChanges when not from template', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_TITLE',
                payload: 'New Title',
            })

            expect(result.hasTemplateChanges).toBe(false)
        })

        it('should set hasTemplateChanges to true when from template and title differs from snapshot', () => {
            const stateFromTemplate = { ...initialState, isFromTemplate: true }
            const result = guidanceReducer(stateFromTemplate, {
                type: 'SET_TITLE',
                payload: 'Different Title',
            })

            expect(result.hasTemplateChanges).toBe(true)
        })

        it('should keep hasTemplateChanges false when from template but title matches snapshot', () => {
            const stateFromTemplate = { ...initialState, isFromTemplate: true }
            const result = guidanceReducer(stateFromTemplate, {
                type: 'SET_TITLE',
                payload: 'Test Title',
            })

            expect(result.hasTemplateChanges).toBe(false)
        })

        it('should preserve hasTemplateChanges true once set', () => {
            const stateWithChanges = {
                ...initialState,
                isFromTemplate: true,
                hasTemplateChanges: true,
            }
            const result = guidanceReducer(stateWithChanges, {
                type: 'SET_TITLE',
                payload: 'Test Title',
            })

            expect(result.hasTemplateChanges).toBe(true)
        })
    })

    describe('SET_CONTENT', () => {
        it('should update content', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_CONTENT',
                payload: 'New Content',
            })

            expect(result.content).toBe('New Content')
        })

        it('should not update hasTemplateChanges when not from template', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_CONTENT',
                payload: 'New Content',
            })

            expect(result.hasTemplateChanges).toBe(false)
        })

        it('should set hasTemplateChanges to true when from template and content differs from snapshot', () => {
            const stateFromTemplate = { ...initialState, isFromTemplate: true }
            const result = guidanceReducer(stateFromTemplate, {
                type: 'SET_CONTENT',
                payload: 'Different Content',
            })

            expect(result.hasTemplateChanges).toBe(true)
        })

        it('should keep hasTemplateChanges false when from template but content matches snapshot', () => {
            const stateFromTemplate = { ...initialState, isFromTemplate: true }
            const result = guidanceReducer(stateFromTemplate, {
                type: 'SET_CONTENT',
                payload: 'Test Content',
            })

            expect(result.hasTemplateChanges).toBe(false)
        })

        it('should preserve hasTemplateChanges true once set', () => {
            const stateWithChanges = {
                ...initialState,
                isFromTemplate: true,
                hasTemplateChanges: true,
            }
            const result = guidanceReducer(stateWithChanges, {
                type: 'SET_CONTENT',
                payload: 'Test Content',
            })

            expect(result.hasTemplateChanges).toBe(true)
        })
    })

    describe('SET_VISIBILITY', () => {
        it('should set visibility to true', () => {
            const stateNotVisible = { ...initialState, visibility: false }
            const result = guidanceReducer(stateNotVisible, {
                type: 'SET_VISIBILITY',
                payload: true,
            })

            expect(result.visibility).toBe(true)
        })

        it('should set visibility to false', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_VISIBILITY',
                payload: false,
            })

            expect(result.visibility).toBe(false)
        })

        it('should update guidance.visibility to PUBLIC when setting visibility to true', () => {
            const stateNotVisible = {
                ...initialState,
                visibility: false,
                guidance: { ...mockGuidance, visibility: 'UNLISTED' as const },
            }
            const result = guidanceReducer(stateNotVisible, {
                type: 'SET_VISIBILITY',
                payload: true,
            })

            expect(result.guidance?.visibility).toBe('PUBLIC')
        })

        it('should update guidance.visibility to UNLISTED when setting visibility to false', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_VISIBILITY',
                payload: false,
            })

            expect(result.guidance?.visibility).toBe('UNLISTED')
        })

        it('should handle undefined guidance gracefully', () => {
            const stateWithoutGuidance = {
                ...initialState,
                guidance: undefined,
            }
            const result = guidanceReducer(stateWithoutGuidance, {
                type: 'SET_VISIBILITY',
                payload: true,
            })

            expect(result.visibility).toBe(true)
            expect(result.guidance).toBeUndefined()
        })
    })

    describe('RESET_FORM', () => {
        it('should reset form fields with provided values', () => {
            const stateWithChanges = {
                ...initialState,
                title: 'Changed Title',
                content: 'Changed Content',
                visibility: false,
                isAutoSaving: true,
            }

            const result = guidanceReducer(stateWithChanges, {
                type: 'RESET_FORM',
                payload: {
                    title: 'Reset Title',
                    content: 'Reset Content',
                    visibility: true,
                },
            })

            expect(result.title).toBe('Reset Title')
            expect(result.content).toBe('Reset Content')
            expect(result.visibility).toBe(true)
            expect(result.savedSnapshot).toEqual({
                title: 'Reset Title',
                content: 'Reset Content',
            })
            expect(result.isAutoSaving).toBe(false)
        })

        it('should update savedSnapshot with reset values', () => {
            const result = guidanceReducer(initialState, {
                type: 'RESET_FORM',
                payload: {
                    title: 'New Title',
                    content: 'New Content',
                    visibility: false,
                },
            })

            expect(result.savedSnapshot.title).toBe('New Title')
            expect(result.savedSnapshot.content).toBe('New Content')
        })
    })

    describe('MARK_AS_SAVED', () => {
        it('should preserve current edits and update savedSnapshot', () => {
            const newGuidance: GuidanceArticle = {
                ...mockGuidance,
                id: 456,
                title: 'Saved Title',
                content: 'Saved Content',
            }

            const result = guidanceReducer(initialState, {
                type: 'MARK_AS_SAVED',
                payload: {
                    title: 'Saved Title',
                    content: 'Saved Content',
                    guidance: newGuidance,
                },
            })

            // Should preserve user's current edits, not overwrite them
            expect(result.title).toBe('Test Title')
            expect(result.content).toBe('Test Content')
            expect(result.guidance).toEqual(newGuidance)
            // Only savedSnapshot should be updated to track what was saved
            expect(result.savedSnapshot).toEqual({
                title: 'Saved Title',
                content: 'Saved Content',
            })
            expect(result.isAutoSaving).toBe(false)
        })

        it('should preserve current edits when payload is undefined', () => {
            const stateWithAutoSaving = { ...initialState, isAutoSaving: true }

            const result = guidanceReducer(stateWithAutoSaving, {
                type: 'MARK_AS_SAVED',
            })

            // Current edits are always preserved
            expect(result.title).toBe('Test Title')
            expect(result.content).toBe('Test Content')
            expect(result.guidance).toEqual(mockGuidance)
            // savedSnapshot keeps its previous values when payload is undefined
            expect(result.savedSnapshot).toEqual(initialState.savedSnapshot)
            expect(result.isAutoSaving).toBe(false)
        })

        it('should reset isAutoSaving to false', () => {
            const stateAutoSaving = { ...initialState, isAutoSaving: true }

            const result = guidanceReducer(stateAutoSaving, {
                type: 'MARK_AS_SAVED',
                payload: {
                    title: 'Title',
                    content: 'Content',
                    guidance: mockGuidance,
                },
            })

            expect(result.isAutoSaving).toBe(false)
        })

        it('should set hasAutoSavedInSession to true', () => {
            const stateNotAutoSaved = {
                ...initialState,
                hasAutoSavedInSession: false,
            }

            const result = guidanceReducer(stateNotAutoSaved, {
                type: 'MARK_AS_SAVED',
                payload: {
                    title: 'Title',
                    content: 'Content',
                    guidance: mockGuidance,
                },
            })

            expect(result.hasAutoSavedInSession).toBe(true)
        })

        it('should set hasAutoSavedInSession to true when payload is undefined', () => {
            const stateNotAutoSaved = {
                ...initialState,
                hasAutoSavedInSession: false,
            }

            const result = guidanceReducer(stateNotAutoSaved, {
                type: 'MARK_AS_SAVED',
            })

            expect(result.hasAutoSavedInSession).toBe(true)
        })

        it('should set hasAutoSavedInSession to true', () => {
            const stateNotAutoSaved = {
                ...initialState,
                hasAutoSavedInSession: false,
            }

            const result = guidanceReducer(stateNotAutoSaved, {
                type: 'MARK_AS_SAVED',
                payload: {
                    title: 'Title',
                    content: 'Content',
                    guidance: mockGuidance,
                },
            })

            expect(result.hasAutoSavedInSession).toBe(true)
        })

        it('should set hasAutoSavedInSession to true when payload is undefined', () => {
            const stateNotAutoSaved = {
                ...initialState,
                hasAutoSavedInSession: false,
            }

            const result = guidanceReducer(stateNotAutoSaved, {
                type: 'MARK_AS_SAVED',
            })

            expect(result.hasAutoSavedInSession).toBe(true)
        })

        it('should update guidance and mark autosave state when payload has guidance only', () => {
            const stateWithAutoSaveFlags = {
                ...initialState,
                isAutoSaving: true,
                hasAutoSavedInSession: false,
                autoSaveError: true,
                savedSnapshot: {
                    title: 'Initial title',
                    content: 'Initial content',
                },
            }
            const newGuidance: GuidanceArticle = {
                ...mockGuidance,
                intents: ['account::deletion'],
            }

            const result = guidanceReducer(stateWithAutoSaveFlags, {
                type: 'MARK_AS_SAVED',
                payload: { guidance: newGuidance },
            })

            expect(result.guidance).toEqual(newGuidance)
            expect(result.savedSnapshot).toEqual({
                title: 'Initial title',
                content: 'Initial content',
            })
            expect(result.isAutoSaving).toBe(false)
            expect(result.hasAutoSavedInSession).toBe(true)
            expect(result.autoSaveError).toBe(false)
        })
    })

    describe('SET_AUTO_SAVING', () => {
        it('should set isAutoSaving to true', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_AUTO_SAVING',
                payload: true,
            })

            expect(result.isAutoSaving).toBe(true)
        })

        it('should set isAutoSaving to false', () => {
            const stateAutoSaving = { ...initialState, isAutoSaving: true }
            const result = guidanceReducer(stateAutoSaving, {
                type: 'SET_AUTO_SAVING',
                payload: false,
            })

            expect(result.isAutoSaving).toBe(false)
        })

        it('should return the same state when value does not change', () => {
            const stateAutoSaving = { ...initialState, isAutoSaving: true }

            const result = guidanceReducer(stateAutoSaving, {
                type: 'SET_AUTO_SAVING',
                payload: true,
            })

            expect(result).toBe(stateAutoSaving)
        })

        it('should clear auto save error when toggled to true', () => {
            const stateWithError = {
                ...initialState,
                autoSaveError: true,
            }

            const result = guidanceReducer(stateWithError, {
                type: 'SET_AUTO_SAVING',
                payload: true,
            })

            expect(result.isAutoSaving).toBe(true)
            expect(result.autoSaveError).toBe(false)
        })

        it('should return same state when false does not change values', () => {
            const stateWithoutSaving = {
                ...initialState,
                isAutoSaving: false,
                autoSaveError: true,
            }

            const result = guidanceReducer(stateWithoutSaving, {
                type: 'SET_AUTO_SAVING',
                payload: false,
            })

            expect(result).toBe(stateWithoutSaving)
        })
    })

    describe('SET_VERSION_STATUS', () => {
        it('should set versionStatus to current', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_VERSION_STATUS',
                payload: 'current',
            })

            expect(result.versionStatus).toBe('current')
        })

        it('should set versionStatus to latest_draft', () => {
            const stateCurrent = {
                ...initialState,
                versionStatus: 'current' as const,
            }
            const result = guidanceReducer(stateCurrent, {
                type: 'SET_VERSION_STATUS',
                payload: 'latest_draft',
            })

            expect(result.versionStatus).toBe('latest_draft')
        })
    })

    describe('SWITCH_VERSION', () => {
        const newVersionGuidance: GuidanceArticle = {
            ...mockGuidance,
            id: 789,
            title: 'Version Title',
            content: 'Version Content',
            isCurrent: true,
        }

        it('should switch from latest_draft to current', () => {
            const result = guidanceReducer(initialState, {
                type: 'SWITCH_VERSION',
                payload: newVersionGuidance,
            })

            expect(result.versionStatus).toBe('current')
            expect(result.guidance).toEqual(newVersionGuidance)
            expect(result.title).toBe('Version Title')
            expect(result.content).toBe('Version Content')
            expect(result.savedSnapshot).toEqual({
                title: 'Version Title',
                content: 'Version Content',
            })
        })

        it('should switch from current to latest_draft', () => {
            const stateCurrent = {
                ...initialState,
                versionStatus: 'current' as const,
            }
            const result = guidanceReducer(stateCurrent, {
                type: 'SWITCH_VERSION',
                payload: newVersionGuidance,
            })

            expect(result.versionStatus).toBe('latest_draft')
        })

        it('should set guidanceMode to read when switching to current version', () => {
            const result = guidanceReducer(initialState, {
                type: 'SWITCH_VERSION',
                payload: newVersionGuidance,
            })

            expect(result.guidanceMode).toBe('read')
        })

        it('should preserve guidanceMode when switching to latest_draft', () => {
            const stateCurrent = {
                ...initialState,
                versionStatus: 'current' as const,
                guidanceMode: 'edit' as const,
            }
            const result = guidanceReducer(stateCurrent, {
                type: 'SWITCH_VERSION',
                payload: newVersionGuidance,
            })

            expect(result.guidanceMode).toBe('edit')
        })

        it('should reset hasAutoSavedInSession to false when switching versions', () => {
            const stateWithAutoSaved = {
                ...initialState,
                hasAutoSavedInSession: true,
            }
            const result = guidanceReducer(stateWithAutoSaved, {
                type: 'SWITCH_VERSION',
                payload: newVersionGuidance,
            })

            expect(result.hasAutoSavedInSession).toBe(false)
        })
    })

    describe('SET_MODAL', () => {
        it('should set activeModal to unsaved', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_MODAL',
                payload: 'unsaved',
            })

            expect(result.activeModal).toBe('unsaved')
        })

        it('should set activeModal to discard', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_MODAL',
                payload: 'discard',
            })

            expect(result.activeModal).toBe('discard')
        })

        it('should set activeModal to delete', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_MODAL',
                payload: 'delete',
            })

            expect(result.activeModal).toBe('delete')
        })

        it('should set activeModal to publish', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_MODAL',
                payload: 'publish',
            })

            expect(result.activeModal).toBe('publish')
        })

        it('should set activeModal to restore', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_MODAL',
                payload: 'restore',
            })

            expect(result.activeModal).toBe('restore')
        })

        it('should set activeModal to publish', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_MODAL',
                payload: 'publish',
            })

            expect(result.activeModal).toBe('publish')
        })

        it('should set activeModal to restore', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_MODAL',
                payload: 'restore',
            })

            expect(result.activeModal).toBe('restore')
        })

        it('should set activeModal to null', () => {
            const stateWithModal = {
                ...initialState,
                activeModal: 'unsaved' as const,
            }
            const result = guidanceReducer(stateWithModal, {
                type: 'SET_MODAL',
                payload: null,
            })

            expect(result.activeModal).toBe(null)
        })
    })

    describe('CLOSE_MODAL', () => {
        it('should set activeModal to null', () => {
            const stateWithModal = {
                ...initialState,
                activeModal: 'unsaved' as const,
            }
            const result = guidanceReducer(stateWithModal, {
                type: 'CLOSE_MODAL',
            })

            expect(result.activeModal).toBe(null)
        })

        it('should work when activeModal is already null', () => {
            const result = guidanceReducer(initialState, {
                type: 'CLOSE_MODAL',
            })

            expect(result.activeModal).toBe(null)
        })
    })

    describe('SET_UPDATING', () => {
        it('should set isUpdating to true', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_UPDATING',
                payload: true,
            })

            expect(result.isUpdating).toBe(true)
        })

        it('should set isUpdating to false', () => {
            const stateUpdating = { ...initialState, isUpdating: true }
            const result = guidanceReducer(stateUpdating, {
                type: 'SET_UPDATING',
                payload: false,
            })

            expect(result.isUpdating).toBe(false)
        })

        it('should return the same state when value does not change', () => {
            const stateUpdating = { ...initialState, isUpdating: true }

            const result = guidanceReducer(stateUpdating, {
                type: 'SET_UPDATING',
                payload: true,
            })

            expect(result).toBe(stateUpdating)
        })
    })

    describe('SWITCH_GUIDANCE', () => {
        const newArticle: GuidanceArticle = {
            id: 999,
            title: 'New Article Title',
            content: 'New Article Content',
            locale: 'fr-FR',
            visibility: 'UNLISTED',
            createdDatetime: '2024-02-01T00:00:00Z',
            lastUpdated: '2024-02-01T00:00:00Z',
            templateKey: 'template-1',
            isCurrent: true,
            draftVersionId: 2,
            publishedVersionId: 1,
        }

        it('should reset state with new article in read mode', () => {
            const result = guidanceReducer(initialState, {
                type: 'SWITCH_GUIDANCE',
                payload: {
                    article: newArticle,
                    mode: 'read',
                },
            })

            expect(result.guidanceMode).toBe('read')
            expect(result.guidance).toEqual(newArticle)
            expect(result.title).toBe('New Article Title')
            expect(result.content).toBe('New Article Content')
        })

        it('should reset state with new article in edit mode', () => {
            const result = guidanceReducer(initialState, {
                type: 'SWITCH_GUIDANCE',
                payload: {
                    article: newArticle,
                    mode: 'edit',
                },
            })

            expect(result.guidanceMode).toBe('edit')
            expect(result.guidance).toEqual(newArticle)
        })

        it('should reset all temporary state when switching guidance', () => {
            const stateWithChanges = {
                ...initialState,
                isFullscreen: true,
                isAutoSaving: true,
                hasTemplateChanges: true,
                activeModal: 'unsaved' as const,
                isUpdating: true,
            }

            const result = guidanceReducer(stateWithChanges, {
                type: 'SWITCH_GUIDANCE',
                payload: {
                    article: newArticle,
                    mode: 'read',
                },
            })

            expect(result.isFullscreen).toBe(false)
            expect(result.isAutoSaving).toBe(false)
            expect(result.hasTemplateChanges).toBe(false)
            expect(result.activeModal).toBe(null)
            expect(result.isUpdating).toBe(false)
        })

        it('should set visibility based on article visibility', () => {
            const result = guidanceReducer(initialState, {
                type: 'SWITCH_GUIDANCE',
                payload: {
                    article: newArticle,
                    mode: 'read',
                },
            })

            expect(result.visibility).toBe(false)
        })

        it('should set savedSnapshot from new article', () => {
            const result = guidanceReducer(initialState, {
                type: 'SWITCH_GUIDANCE',
                payload: {
                    article: newArticle,
                    mode: 'read',
                },
            })

            expect(result.savedSnapshot).toEqual({
                title: 'New Article Title',
                content: 'New Article Content',
            })
        })
    })

    describe('VIEW_HISTORICAL_VERSION', () => {
        const mockImpactDateRange = {
            start_datetime: '2024-01-10T00:00:00Z',
            end_datetime: '2024-02-15T00:00:00Z',
        }

        const historicalVersionPayload = {
            id: 5,
            version: 3,
            title: 'Historical Title',
            excerpt: 'Historical Excerpt',
            content: 'Historical Content',
            slug: 'historical-title',
            seo_meta: null,
            created_datetime: '2024-01-05T00:00:00Z',
            published_datetime: '2024-01-10T00:00:00Z',
            publisher_user_id: 42,
            commit_message: 'Published version 3',
            impactDateRange: mockImpactDateRange,
        }

        it('should set historicalVersion with correct data', () => {
            const result = guidanceReducer(initialState, {
                type: 'VIEW_HISTORICAL_VERSION',
                payload: historicalVersionPayload,
            })

            expect(result.historicalVersion).toEqual({
                versionId: 5,
                version: 3,
                title: 'Historical Title',
                content: 'Historical Content',
                publishedDatetime: '2024-01-10T00:00:00Z',
                publisherUserId: 42,
                commitMessage: 'Published version 3',
                impactDateRange: mockImpactDateRange,
            })
        })

        it('should update title and content with historical version values', () => {
            const result = guidanceReducer(initialState, {
                type: 'VIEW_HISTORICAL_VERSION',
                payload: historicalVersionPayload,
            })

            expect(result.title).toBe('Historical Title')
            expect(result.content).toBe('Historical Content')
        })

        it('should set guidanceMode to read', () => {
            const stateInEdit = {
                ...initialState,
                guidanceMode: 'edit' as const,
            }
            const result = guidanceReducer(stateInEdit, {
                type: 'VIEW_HISTORICAL_VERSION',
                payload: historicalVersionPayload,
            })

            expect(result.guidanceMode).toBe('read')
        })

        it('should handle null title gracefully', () => {
            const payloadWithNullTitle = {
                ...historicalVersionPayload,
                title: null as unknown as string,
            }

            const result = guidanceReducer(initialState, {
                type: 'VIEW_HISTORICAL_VERSION',
                payload: payloadWithNullTitle,
            })

            expect(result.historicalVersion?.title).toBe('')
            expect(result.title).toBe('')
        })

        it('should handle null content gracefully', () => {
            const payloadWithNullContent = {
                ...historicalVersionPayload,
                content: null as unknown as string,
            }

            const result = guidanceReducer(initialState, {
                type: 'VIEW_HISTORICAL_VERSION',
                payload: payloadWithNullContent,
            })

            expect(result.historicalVersion?.content).toBe('')
            expect(result.content).toBe('')
        })

        it('should handle undefined title gracefully', () => {
            const payloadWithUndefinedTitle = {
                ...historicalVersionPayload,
                title: undefined as unknown as string,
            }

            const result = guidanceReducer(initialState, {
                type: 'VIEW_HISTORICAL_VERSION',
                payload: payloadWithUndefinedTitle,
            })

            expect(result.historicalVersion?.title).toBe('')
            expect(result.title).toBe('')
        })

        it('should handle undefined content gracefully', () => {
            const payloadWithUndefinedContent = {
                ...historicalVersionPayload,
                content: undefined as unknown as string,
            }

            const result = guidanceReducer(initialState, {
                type: 'VIEW_HISTORICAL_VERSION',
                payload: payloadWithUndefinedContent,
            })

            expect(result.historicalVersion?.content).toBe('')
            expect(result.content).toBe('')
        })

        it('should preserve other state properties', () => {
            const stateWithFullscreen = {
                ...initialState,
                isFullscreen: true,
                isDetailsView: false,
            }

            const result = guidanceReducer(stateWithFullscreen, {
                type: 'VIEW_HISTORICAL_VERSION',
                payload: historicalVersionPayload,
            })

            expect(result.isFullscreen).toBe(true)
            expect(result.isDetailsView).toBe(false)
        })

        it('should handle missing optional fields', () => {
            const minimalPayload = {
                id: 1,
                version: 1,
                title: 'Minimal Title',
                excerpt: 'Minimal Excerpt',
                content: 'Minimal Content',
                slug: 'minimal-title',
                seo_meta: null,
                created_datetime: '2024-01-01T00:00:00Z',
                published_datetime: null,
                impactDateRange: mockImpactDateRange,
            }

            const result = guidanceReducer(initialState, {
                type: 'VIEW_HISTORICAL_VERSION',
                payload: minimalPayload,
            })

            expect(result.historicalVersion).toEqual({
                versionId: 1,
                version: 1,
                title: 'Minimal Title',
                content: 'Minimal Content',
                publishedDatetime: null,
                publisherUserId: undefined,
                commitMessage: undefined,
                impactDateRange: mockImpactDateRange,
            })
        })
    })

    describe('CLEAR_HISTORICAL_VERSION', () => {
        const stateWithHistoricalVersion: GuidanceState = {
            ...initialState,
            historicalVersion: {
                versionId: 5,
                version: 3,
                title: 'Historical Title',
                content: 'Historical Content',
                publishedDatetime: '2024-01-10T00:00:00Z',
                publisherUserId: 42,
                commitMessage: 'Published version 3',
                impactDateRange: {
                    start_datetime: '2024-01-10T00:00:00Z',
                    end_datetime: '2024-02-15T00:00:00Z',
                },
            },
            title: 'Historical Title',
            content: 'Historical Content',
            guidanceMode: 'read',
        }

        it('should set historicalVersion to null', () => {
            const result = guidanceReducer(stateWithHistoricalVersion, {
                type: 'CLEAR_HISTORICAL_VERSION',
            })

            expect(result.historicalVersion).toBeNull()
        })

        it('should restore title from guidance', () => {
            const result = guidanceReducer(stateWithHistoricalVersion, {
                type: 'CLEAR_HISTORICAL_VERSION',
            })

            expect(result.title).toBe(mockGuidance.title)
        })

        it('should restore content from guidance', () => {
            const result = guidanceReducer(stateWithHistoricalVersion, {
                type: 'CLEAR_HISTORICAL_VERSION',
            })

            expect(result.content).toBe(mockGuidance.content)
        })

        it('should handle undefined guidance gracefully', () => {
            const stateWithoutGuidance: GuidanceState = {
                ...stateWithHistoricalVersion,
                guidance: undefined,
            }

            const result = guidanceReducer(stateWithoutGuidance, {
                type: 'CLEAR_HISTORICAL_VERSION',
            })

            expect(result.historicalVersion).toBeNull()
            expect(result.title).toBe('')
            expect(result.content).toBe('')
        })

        it('should preserve other state properties', () => {
            const stateWithOtherProps: GuidanceState = {
                ...stateWithHistoricalVersion,
                isFullscreen: true,
                isDetailsView: false,
                visibility: false,
            }

            const result = guidanceReducer(stateWithOtherProps, {
                type: 'CLEAR_HISTORICAL_VERSION',
            })

            expect(result.isFullscreen).toBe(true)
            expect(result.isDetailsView).toBe(false)
            expect(result.visibility).toBe(false)
        })

        it('should work when historicalVersion is already null', () => {
            const result = guidanceReducer(initialState, {
                type: 'CLEAR_HISTORICAL_VERSION',
            })

            expect(result.historicalVersion).toBeNull()
            expect(result.title).toBe(mockGuidance.title)
            expect(result.content).toBe(mockGuidance.content)
        })

        it('should reset guidanceMode to read when in diff mode', () => {
            const stateInDiffMode: GuidanceState = {
                ...stateWithHistoricalVersion,
                guidanceMode: 'diff',
            }

            const result = guidanceReducer(stateInDiffMode, {
                type: 'CLEAR_HISTORICAL_VERSION',
            })

            expect(result.guidanceMode).toBe('read')
        })
    })

    describe('SET_COMPARISON_VERSION', () => {
        it('should set comparisonVersion with provided title and content', () => {
            const result = guidanceReducer(initialState, {
                type: 'SET_COMPARISON_VERSION',
                payload: {
                    title: 'Published Version Title',
                    content: 'Published Version Content',
                },
            })

            expect(result.comparisonVersion).toEqual({
                title: 'Published Version Title',
                content: 'Published Version Content',
            })
        })

        it('should not change title and content in state', () => {
            const stateWithContent = {
                ...initialState,
                title: 'Draft Title',
                content: 'Draft Content',
            }

            const result = guidanceReducer(stateWithContent, {
                type: 'SET_COMPARISON_VERSION',
                payload: {
                    title: 'Published Version Title',
                    content: 'Published Version Content',
                },
            })

            expect(result.title).toBe('Draft Title')
            expect(result.content).toBe('Draft Content')
        })

        it('should preserve other state properties', () => {
            const stateWithOtherProps: GuidanceState = {
                ...initialState,
                guidanceMode: 'diff',
                isFullscreen: true,
                isDetailsView: false,
            }

            const result = guidanceReducer(stateWithOtherProps, {
                type: 'SET_COMPARISON_VERSION',
                payload: {
                    title: 'Published Title',
                    content: 'Published Content',
                },
            })

            expect(result.guidanceMode).toBe('diff')
            expect(result.isFullscreen).toBe(true)
            expect(result.isDetailsView).toBe(false)
        })

        it('should set comparisonVersion without replacing historicalVersion', () => {
            const stateWithHistoricalVersion: GuidanceState = {
                ...initialState,
                historicalVersion: {
                    versionId: 42,
                    version: 3,
                    title: 'Old Historical Title',
                    content: 'Old Historical Content',
                    publishedDatetime: '2025-03-15T14:30:00Z',
                    commitMessage: 'Previous version',
                    impactDateRange: {
                        start_datetime: '2025-03-15T00:00:00Z',
                        end_datetime: '2025-03-16T00:00:00Z',
                    },
                },
            }

            const result = guidanceReducer(stateWithHistoricalVersion, {
                type: 'SET_COMPARISON_VERSION',
                payload: {
                    title: 'New Published Title',
                    content: 'New Published Content',
                },
            })

            expect(result.comparisonVersion).toEqual({
                title: 'New Published Title',
                content: 'New Published Content',
            })
            expect(result.historicalVersion).toEqual(
                stateWithHistoricalVersion.historicalVersion,
            )
        })
    })

    describe('default case', () => {
        it('should return unchanged state for unknown action', () => {
            const result = guidanceReducer(initialState, {
                type: 'UNKNOWN_ACTION' as any,
            })

            expect(result).toEqual(initialState)
        })
    })
})
