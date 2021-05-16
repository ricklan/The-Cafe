# Cafe-Backend REST API Documentation

## Cafe API

### Create
- description: Endpoint for setting the user's demographic info
- request: `POST /api/setUserDemographic/`
-  response: 200
      - content-type: `application/json`
      - body: object
        - age: (int) user's age
        - ethnicity: (int) user's ethnicity
        - interests: (string) user's interests
        - gender: (int) user's gender
        - id: (string) user's id
``` 
$ curl -X POST 
  -H 'Content-Type: application/json' 
  -H 'Origin: http://localhost:3000' 
  -H 'Sec-Fetch-Site: same-site' 
  -H 'Sec-Fetch-Mode: cors' 
  -H 'Sec-Fetch-Dest: empty' 
  --data '{"age":18,"ethnicity":0,"gender":0,"interests":""}' 
  'https://thecafe.ml/api/setUserDemographic/'
```

### READ

- description: Endpoint for checking that users have filled out the demographic information and for pairing up users
- request: `GET /api/matchVideo/`
-  response: 200
      - content-type: `application/json`
      - body: object
        - age: (int) user's age
        - ethnicity: (int) user's ethnicity
        - interests: (string) user's interests
        - gender: (int) user's gender
        - id: (string) user's id
        - startDate: (int) the time in which this endpoint was called
-  response: 404
      - body: You did not fill out the details on the dashboard.
``` 
$ curl https://thecafe.ml/api/matchVideo/ 
```

- description: Endpoint for getting the user's demographic info
- request: `GET /api/getUserDemographic/`
-  response: 200
      - content-type: `application/json`
      - body: object
        - age: (int) user's age
        - ethnicity: (int) user's ethnicity
        - interests: (string) user's interests
        - gender: (int) user's gender
        - id: (string) user's id

``` 
$ curl https://thecafe.ml/api/getUserDemographic/
```
