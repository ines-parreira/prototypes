import toInitialStoreState, {
    TICKET_QA_SCORE_DIMENSIONS_FILTER_SCHEMA_DEFINITION,
} from 'common/store/toInitialStoreState'
import { initialState } from 'fixtures/initialState'

describe('toInitialStoreState', () => {
    it('should return the expected store state', () => {
        expect(toInitialStoreState(initialState)).toMatchSnapshot()
    })

    it('should should include qa_score_dimension schema definitions when initialState has Ticket > properties', () => {
        const initialStateWithSchemaDefinitions = {
            ...initialState,
        }

        initialStateWithSchemaDefinitions.schemas.definitions = {
            Ticket: {
                properties: {},
            },
        }

        const state = toInitialStoreState(
            initialStateWithSchemaDefinitions,
        ) as any

        expect(
            state.schemas.toJS().definitions.Ticket.properties
                .qa_score_dimensions,
        ).toEqual(TICKET_QA_SCORE_DIMENSIONS_FILTER_SCHEMA_DEFINITION)
    })
})
