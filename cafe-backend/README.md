# ABOUT
this is a REST API for _cafe_

listens on `localhost:3001`

# GET STARTED 
- `SET NODE_ENV=production`
- `npm i`
- `npm start`

# CODING CONVENTION
- only use camelcase on both frontend and backend
- global styles go in style.scss
- ui is mainly handled by material-ui
- scss class names are in 'this-format'
- each model class is a collection in mongodb 
	- each model must have a static variable indicating mongodb collection name
	- each model must have no logic, only defining the schema of the collection

# NOTES
- whitelist your ip on mongo atlas or else the db cant connect