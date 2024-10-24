import {renderHook} from '@testing-library/react-hooks'
import {produce} from 'immer'
import _noop from 'lodash/noop'

import {visualBuilderGraphSimpleChoicesFixture} from '../../tests/visualBuilderGraph.fixtures'

import {
    createVisualBuilderContextForPreview,
    useVisualBuilder,
} from '../useVisualBuilder'

describe('useVisualBuilder()', () => {
    describe('checkNewVisualBuilderNode()', () => {
        it('should return true if updated_datetime is missing', () => {
            const {result} = renderHook(() =>
                useVisualBuilder(
                    visualBuilderGraphSimpleChoicesFixture,
                    _noop,
                    false
                )
            )

            expect(
                result.current.checkNewVisualBuilderNode('messages1')
            ).toEqual(true)
        })

        it('should return true if node is missing from original configuration', () => {
            const {result} = renderHook(() =>
                useVisualBuilder(
                    produce(visualBuilderGraphSimpleChoicesFixture, (draft) => {
                        draft.wfConfigurationOriginal.updated_datetime =
                            '2024-08-28T08:09:09.212Z'
                    }),
                    _noop,
                    false
                )
            )

            expect(
                result.current.checkNewVisualBuilderNode('http_request1')
            ).toEqual(true)
        })

        it('should return false if node is exists in original configuration', () => {
            const {result} = renderHook(() =>
                useVisualBuilder(
                    produce(visualBuilderGraphSimpleChoicesFixture, (draft) => {
                        draft.wfConfigurationOriginal.updated_datetime =
                            '2024-08-28T08:09:09.212Z'
                    }),
                    _noop,
                    false
                )
            )

            expect(
                result.current.checkNewVisualBuilderNode('messages1')
            ).toEqual(false)
        })
    })
})

describe('createVisualBuilderContextForPreview()', () => {
    it('should create stub context value', () => {
        const contextValue = createVisualBuilderContextForPreview(
            visualBuilderGraphSimpleChoicesFixture
        )

        expect(contextValue.visualBuilderGraph).toEqual(
            visualBuilderGraphSimpleChoicesFixture
        )
        expect(
            contextValue.checkInvalidConditionsForNode({
                id: 'conditions1',
                type: 'conditions',
                data: {name: ''},
            })
        ).toEqual(false)
        expect(
            contextValue.checkInvalidVariablesForNode({
                id: 'conditions1',
                type: 'conditions',
                data: {name: ''},
            })
        ).toEqual(false)
        expect(
            contextValue.checkNodeHasVariablesUsedInChildren('conditions1')
        ).toEqual(false)
        expect(
            contextValue.checkNodeHasVariablesUsedInChildren('conditions1')
        ).toEqual(false)
        expect(contextValue.dispatch).toEqual(_noop)
        expect(contextValue.getVariableListInChildren('conditions1')).toEqual(
            []
        )
        expect(contextValue.checkNewVisualBuilderNode('conditions1')).toEqual(
            false
        )
        expect(contextValue.shouldShowErrors).toEqual(false)
    })
})
