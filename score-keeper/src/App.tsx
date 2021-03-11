import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    NavLink,
} from 'react-router-dom';
import './App.css';
import NewBoard from './pages/NewBoard/NewBoard';
import Boards from './pages/Boards/Boards';
import Home from "./pages/Home/Home";

function App() {

    return (
        <Router>
            <div className="app-ctr">
                <div className="nav-ctr">
                    <h3>Score Keeper</h3>
                    <nav>
                        <ul>
                            <li>
                                <NavLink exact to="/">
                                    Home
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/new">New Board</NavLink>
                            </li>
                            <li>
                                <NavLink to="/boards">Boards</NavLink>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
                <Switch>
                    <Route path="/new">
                        <NewBoard />
                    </Route>
                    <Route exact path="/boards/:key/">
                        <Boards />
                    </Route>
                    <Route path="/boards/:key/:follow" component={() => <Boards follow={true} />} />
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

export default App;
