import React, { useEffect, useState } from 'react';
import { Button } from '@material-ui/core';
import './Dashboard.scss';

import { Drawer } from '@material-ui/core';
import DemographicDialog from './DemographicDialog';
import { userDemographic$ } from '../../data/api';
import { useHistory } from 'react-router';

export default function Dashboard() {
    const [state, setState] = useState({
        drawerExpanded: false,
    });
    const toggleDrawer = (expanded: boolean) => {
        setState({ ...state, drawerExpanded: expanded });
    };
    useEffect(() => {
        let sub = userDemographic$.subscribe((demo) => {
            if (demo === '') {
                setTimeout(() => {
                    toggleDrawer(true);
                }, 1000);
            } else if (demo !== undefined) {
                toggleDrawer(false);
            }
        });
        return () => {
            sub.unsubscribe();
        };
    }, []);

    const history = useHistory();

    return (
        <div id="dashboard-host">
            <div className="floating-title logo"> The Cafe </div>
            <div className="buttons-array">
                <div className="array-title">Connect with a stranger!</div>

                <Button
                    variant="outlined"
                    size="large"
                    color="primary"
                    onClick={() => history.push('/queue/', { data: 'video' })}
                >
                    Video + Audio + Text
                </Button>
            </div>
            <div className="settings-bar">
                <Button
                    variant="outlined"
                    size="large"
                    color="primary"
                    onClick={() => {
                        toggleDrawer(true);
                    }}
                >
                    Edit Demographic Info
                </Button>
            </div>
            <Drawer
                anchor={'top'}
                open={state.drawerExpanded}
                onClose={() => {
                    toggleDrawer(false);
                }}
            >
                <DemographicDialog></DemographicDialog>
            </Drawer>
        </div>
    );
}
