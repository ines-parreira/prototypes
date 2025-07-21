import _noop from 'lodash/noop'

import { renderHookWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { visualBuilderGraphSimpleChoicesFixture } from '../../tests/visualBuilderGraph.fixtures'
import {
    createVisualBuilderContextForPreview,
    useVisualBuilder,
} from '../useVisualBuilder'

describe('useVisualBuilder()', () => {
    describe('checkNewVisualBuilderNode()', () => {
        it('should return true if graph is new', () => {
            const { result } = renderHookWithQueryClientProvider(() =>
                useVisualBuilder(
                    visualBuilderGraphSimpleChoicesFixture,
                    _noop,
                    true,
                ),
            )

            expect(
                result.current.checkNewVisualBuilderNode('messages1'),
            ).toEqual(true)
        })

        it('should return true if node is missing from original configuration', () => {
            const { result } = renderHookWithQueryClientProvider(() =>
                useVisualBuilder(
                    visualBuilderGraphSimpleChoicesFixture,
                    _noop,
                    false,
                ),
            )

            expect(
                result.current.checkNewVisualBuilderNode('http_request1'),
            ).toEqual(true)
        })

        it('should return false if node exists in original configuration', () => {
            const { result } = renderHookWithQueryClientProvider(() =>
                useVisualBuilder(
                    visualBuilderGraphSimpleChoicesFixture,
                    _noop,
                    false,
                ),
            )

            expect(
                result.current.checkNewVisualBuilderNode('automated_message1'),
            ).toEqual(false)
        })
    })
})

describe('createVisualBuilderContextForPreview()', () => {
    it('should create stub context value', () => {
        const contextValue = createVisualBuilderContextForPreview(
            visualBuilderGraphSimpleChoicesFixture,
        )

        expect(contextValue.visualBuilderGraph).toEqual(
            visualBuilderGraphSimpleChoicesFixture,
        )
        expect(
            contextValue.checkNodeHasVariablesUsedInChildren('conditions1'),
        ).toEqual(false)
        expect(
            contextValue.checkNodeHasVariablesUsedInChildren('conditions1'),
        ).toEqual(false)
        expect(contextValue.dispatch).toEqual(_noop)
        expect(contextValue.getVariableListInChildren('conditions1')).toEqual(
            [],
        )
        expect(contextValue.checkNewVisualBuilderNode('conditions1')).toEqual(
            false,
        )
        expect(contextValue.getVariableListForNode('conditions1')).toEqual([])
        expect(contextValue.isNew).toEqual(false)
    })
})
