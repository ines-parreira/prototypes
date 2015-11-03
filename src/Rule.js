import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import ruleReducer from './reducers/index'
import RuleBox from './components/rule/RuleContainer'
import thunk from 'redux-thunk'

const createStoreWithMiddleware = applyMiddleware(
  thunk
)(createStore);

let store = createStoreWithMiddleware(ruleReducer)
console.log('store')
console.log(store)

ReactDOM.render(
    <Provider store={store} url='/api/rules'>
        <RuleBox />
    </Provider>,
    document.getElementById('App')
)