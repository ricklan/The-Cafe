import React, { useEffect, useRef } from 'react';
import './DemographicDialog.scss';
import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    TextField,
} from '@material-ui/core';
import { setUserDemographic } from '../../data/api';
import { Formik } from 'formik';
import { Select } from '@material-ui/core';
import { userDemographic$ } from '../../data/api';

export default function DemographicDialog() {
    const initValues = {
        age: 18,
        ethnicity: 0,
        gender: 0,
        interests: '',
    };
    let formikRef;

    useEffect(() => {
        let sub = userDemographic$.subscribe((demo) => {
            // listen for previous
            if (![undefined, ''].includes(demo as any)) {
                Object.entries(demo as object).map(([key, value]) => {
                    formikRef?.setFieldValue(key, value);
                });
            }
        });
        return () => {
            sub.unsubscribe();
        };
    }, []);

    return (
        <div id="demo-drawer-host">
            <div className="floating-title logo"> The Cafe </div>
            <Formik
                innerRef={(p) => (formikRef = p)}
                initialValues={initValues}
                onSubmit={(values, { setSubmitting }) => {
                    setUserDemographic(values);

                    setTimeout(() => {
                        setSubmitting(false);
                    }, 400);
                }}
            >
                {({
                    values,
                    handleChange,
                    handleSubmit,
                    isSubmitting,
                    setFieldValue,
                }) => (
                    <form onSubmit={handleSubmit}>
                        <div className="form-row desc">
                            Tell us a bit about yourself to help us better your
                            experience.
                        </div>

                        <div className="form-row">
                            <TextField
                                id="age"
                                label="Age"
                                type="number"
                                InputProps={{
                                    inputProps: {
                                        max: 150,
                                        min: 18,
                                    },
                                }}
                                variant="filled"
                                fullWidth={true}
                                onChange={handleChange}
                                value={values.age}
                            />

                            <FormControl variant="filled" fullWidth={true}>
                                <InputLabel>Ethnicity</InputLabel>
                                <Select
                                    name="ethnicity"
                                    value={values.ethnicity}
                                    onChange={(e) =>
                                        setFieldValue(
                                            e.target.name as string,
                                            e.target.value
                                        )
                                    }
                                >
                                    <MenuItem value={0}>
                                        <em>Prefer not the answer</em>
                                    </MenuItem>
                                    {[
                                        'Eastern Asian',
                                        'Black/African',
                                        'Southern Asian',
                                        'Caucasian',
                                        'Hispanic/Latino',
                                        'Other',
                                    ].map((option, index) => (
                                        <MenuItem key={index} value={index + 1}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl variant="filled" fullWidth={true}>
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    name="gender"
                                    value={values.gender}
                                    onChange={(e) =>
                                        setFieldValue(
                                            e.target.name as string,
                                            e.target.value
                                        )
                                    }
                                >
                                    <MenuItem value={0}>
                                        <em>Prefer not the answer</em>
                                    </MenuItem>
                                    {['Male', 'Female', 'Other'].map(
                                        (option, index) => (
                                            <MenuItem
                                                key={index}
                                                value={index + 1}
                                            >
                                                {option}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="form-row">
                            <TextField
                                id="interests"
                                label="Interests - Enter your interests in comma seperated format"
                                variant="filled"
                                fullWidth={true}
                                multiline={true}
                                rows={4}
                                onChange={handleChange}
                                value={values.interests}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            variant="outlined"
                            size="large"
                            color="primary"
                        >
                            Submit
                        </Button>
                    </form>
                )}
            </Formik>
        </div>
    );
}
