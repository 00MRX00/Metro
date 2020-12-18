import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Lines from './Lines';
import LostThings from './LostThings';
import Staff from './Staff';
import Stations from './Stations';
import Tickets from './Tickets';

export const useRoutes = () => {
    return (
        <Switch>
            <Route path='/staff' exact>
                <Staff />
            </Route>
            <Route path='/lines' exact>
                <Lines />
            </Route>
            <Route path='/stations' exact>
                <Stations />
            </Route>
            <Route path='/tickets' exact>
                <Tickets />
            </Route>
            <Route path='/lostthings' exact>
                <LostThings />
            </Route>
            <Redirect to='staff'/>
        </Switch>
    );
}