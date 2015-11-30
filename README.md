Gorgias JS App
==============

> If you're looking for building JS look at the README.md in the root of the project.

This js app is the frontend for the Gorgias helpdesk. It's built using ReactJS + Redux + many other smaller tools.

If you're a total noob with React + Redux you should checkout this series about Redux: 
    https://egghead.io/series/getting-started-with-redux 
    (There is also a copy on the company's Drive if the URL doesn't work anymore - ask @xarg)
    
Structure
----------

The structure is inspired by this example here: https://github.com/rackt/redux/tree/master/examples/real-world

    ├── actions - where the Redux actions are stored
    ├── components - dump components (no state handling - just presentation)
    ├── constants
    ├── containers - smart components (they handle state - used as wrappers for dump components)
    ├── main.js - entry
    ├── reducers - reducers of Redux
    ├── routes.js
    └── store - combined stores of Redux
    
    
The biggest takeaway is that there are 2 type of components:

 * `components` or `dumb components` - reusable components for presentation only.
 
    These components don't handle changing of the state, they are just there for presentation purposes only. 
    The reason is to separate components that actions and application logic from the ones that are only views.
 
 * `containers` or `wrapper components` - handle state and actions
 
    These ones handle the state and the actions on that state (redux state) and are wrapping dumb components.
    Containers can also wrap other containers of course.
  
 



