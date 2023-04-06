import {
    WorkflowConfiguration,
    WorkflowStepChoices,
    WorkflowStepMessages,
    WorkflowStepWorkflowCall,
} from 'pages/automation/workflows/hooks/useWorkflowApi'
import {reducer} from '../useWorkflowConfigurationReducer'

const genStepMessage = (id: string): WorkflowStepMessages => ({
    id,
    kind: 'messages',
    settings: {
        messages: [{content: {html: '', text: ''}}],
    },
})

const genStepChoices = (
    id: string,
    eventIds: string[]
): WorkflowStepChoices => ({
    id,
    kind: 'choices',
    settings: {
        choices: eventIds.map((eventId) => ({
            event_id: eventId,
            label: '',
        })),
    },
})

const genStepWorkflowCall = (id: string): WorkflowStepWorkflowCall => ({
    id,
    kind: 'workflow_call',
    settings: {
        configuration_id: 'workflow-to-call-id',
    },
})

const genTransition = (
    fromId: string,
    toId: string,
    eventId?: Maybe<string>
): WorkflowConfiguration['transitions'][number] => ({
    id: `${fromId}-${toId}-${eventId ?? ''}`,
    from_step_id: fromId,
    to_step_id: toId,
    ...(eventId ? {event: {id: eventId, kind: 'choices'}} : {}),
})

describe('useWorkflowConfigurationReducer', () => {
    test('configuration reducer basics', () => {
        const conf: WorkflowConfiguration = {
            id: 'a',
            account_id: 1,
            internal_id: 'int-a',
            name: 'a',
            is_draft: false,
            initial_step_id: 's1',
            steps: [genStepMessage('s1'), genStepWorkflowCall('s2')],
            transitions: [genTransition('s1', 's2')],
        }

        // add reply buttons
        const withReplyButtons = reducer(conf, {
            type: 'ADD_REPLY_BUTTONS',
            step_id: 's1',
        })
        // one choices step pointing to two steps messages should have been added
        const stepsChoices = withReplyButtons.steps.filter(
            (s) => s.kind === 'choices'
        )
        const stepsMessages = withReplyButtons.steps.filter(
            (s) => s.kind === 'messages' && s.id !== 's1'
        )
        const stepsWorkflowCall = withReplyButtons.steps.filter(
            (s) => s.kind === 'workflow_call'
        )
        const stepMessagesIds = new Set(stepsMessages.map((s) => s.id))
        const stepWorkflowCallIds = new Set(stepsWorkflowCall.map((s) => s.id))
        expect(stepsChoices.length).toEqual(1)
        expect(stepsMessages.length).toEqual(2)
        expect(stepsWorkflowCall.length).toEqual(2)
        // there should be a a transition from the s1 step to the choices step
        expect(
            withReplyButtons.transitions.find(
                (t) =>
                    t.from_step_id === 's1' &&
                    t.to_step_id === stepsChoices[0].id
            )
        ).toBeDefined()
        // there should be two transitions starting from the choices step
        // and pointing to the two new messages nodes
        const choicesTransitions = withReplyButtons.transitions.filter(
            (t) => t.from_step_id === stepsChoices[0].id
        )
        expect(choicesTransitions.length).toEqual(2)
        const transitionsTargets = new Set(
            choicesTransitions.map((t) => t.to_step_id)
        )
        expect(transitionsTargets).toEqual(stepMessagesIds)
        // there should be two transitions from the two leaves messages nodes going to the workflow call steps
        const workflowCallTransitionsTargets = new Set(
            withReplyButtons.transitions
                .filter((t) => stepMessagesIds.has(t.from_step_id))
                .map((t) => t.to_step_id)
        )
        expect(workflowCallTransitionsTargets).toEqual(stepWorkflowCallIds)

        const withModifiedReplyButton = reducer(withReplyButtons, {
            type: 'SET_REPLY_BUTTON_LABEL',
            label: 'modified',
            step_id: stepsChoices[0].id,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            event_id: (stepsChoices[0].settings as any).choices[0].event_id,
        })
        expect(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (
                withModifiedReplyButton.steps.find(
                    (s) => s.id === stepsChoices[0].id
                )?.settings as any
            ).choices[0].label
        ).toEqual('modified')
    })

    test('configuration reducer delete reply button', () => {
        const conf: WorkflowConfiguration = {
            id: 'a',
            internal_id: 'int-a',
            account_id: 1,
            is_draft: false,
            name: 'a',
            initial_step_id: 's1',
            steps: [
                genStepMessage('s1'),
                genStepChoices('c1', ['es2', 'es3']),
                genStepMessage('s2'),
                genStepMessage('s3'),
                genStepChoices('c2', ['es4', 'es5']),
                genStepMessage('s4'),
                genStepMessage('s5'),
                genStepWorkflowCall('s2-wc'),
                genStepWorkflowCall('s4-wc'),
                genStepWorkflowCall('s5-wc'),
            ],
            transitions: [
                genTransition('s1', 'c1'),
                genTransition('c1', 's2', 'es2'),
                genTransition('c1', 's3', 'es3'),
                genTransition('s3', 'c2'),
                genTransition('c2', 's4', 'es4'),
                genTransition('c2', 's5', 'es5'),
                genTransition('s2', 's2-wc'),
                genTransition('s4', 's4-wc'),
                genTransition('s5', 's5-wc'),
            ],
        }
        const withES3Deleted = reducer(conf, {
            type: 'DELETE_CHOICE',
            step_id: 'c1',
            choice_event_id: 'es3',
        })
        expect(withES3Deleted).toEqual({
            ...conf,
            steps: [
                genStepMessage('s1'),
                genStepChoices('c1', ['es2']),
                genStepMessage('s2'),
                genStepWorkflowCall('s2-wc'),
            ],
            transitions: [
                genTransition('s1', 'c1'),
                genTransition('c1', 's2', 'es2'),
                genTransition('s2', 's2-wc'),
            ],
        })
        const allChoicesDeleted = reducer(withES3Deleted, {
            type: 'DELETE_CHOICE',
            step_id: 'c1',
            choice_event_id: 'es2',
        })
        expect(allChoicesDeleted).toEqual({
            ...conf,
            steps: [
                genStepMessage('s1'),
                expect.objectContaining({kind: 'workflow_call'}),
            ],
            transitions: [expect.objectContaining({from_step_id: 's1'})],
        })
    })
})
