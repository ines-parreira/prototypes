import { VoiceFlowNodeType } from '../constants'
import { EndCallNode, IVRMenuNode } from '../types'
import { canAddNewStepOnEdge } from '../utils'

describe('utils', () => {
    describe('canAddNewStepOnEdge', () => {
        it('should return false if the edge is an IVRMenu', () => {
            const edge = {
                type: VoiceFlowNodeType.IVRMenu,
                id: '1',
                position: { x: 0, y: 0 },
                data: { label: 'IVRMenu' },
            } as IVRMenuNode

            expect(canAddNewStepOnEdge(edge)).toBe(false)
        })

        it('should return true if the edge is not an IVRMenu', () => {
            const edge = {
                type: VoiceFlowNodeType.EndCall,
                id: '1',
                position: { x: 0, y: 0 },
                data: { label: 'End call' },
            } as EndCallNode

            expect(canAddNewStepOnEdge(edge)).toBe(true)
        })
    })
})
