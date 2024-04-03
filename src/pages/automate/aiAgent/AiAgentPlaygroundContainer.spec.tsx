describe('AiAgentPlayground', () => {
    describe('onSubmit', () => {
        test.todo(
            'should display an Alert with a default error if the submit error is not handled'
        )
        test.todo(
            'should clear a potential previous generated answer in case of a submit error'
        )
        test.todo(
            'should display an Alert with a custom error if the submit error is handled'
        )
        test.todo(
            'should not display the ai agent response container if the form was never submitted'
        )
        test.todo('should call the submit mutation correctly')
        test.todo('should call the submit mutation correctly')
        test.todo(
            'should disable the submit button if inputs are empty or form is submitting'
        )
    })
    describe('onReset', () => {
        test.todo('should clear all inputs')
        test.todo('should clear ai agent response')
    })
    describe('dependencies', () => {
        test.todo(
            'should display a loader while store and account data are beeing fetched'
        )
        test.todo(
            'should redirect to /app/automation and dispatch an error if there was an error fetching account or store data'
        )
        test.todo(
            'should redirect to /app/automation and dispatch an error if the account configuration does not include an http integration'
        )
    })
    describe('render ai agent response', () => {
        test.todo(
            'should render ai agent response container only while response is generat-ing/ed'
        )
        test.todo('should render a loader if response is generating')
        test.todo(
            'should render the response, outcome and internal note when generated'
        )
    })
})
