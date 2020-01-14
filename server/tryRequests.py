import requests

parameters = {
	"q":  "scrambled eggs",
	"cx": "006723745949135884597:oiqnkrgsrxi",
	"key":"AIzaSyC5XBcVJYQeAvln406kzMzTGJwFEwyZQ9I",
	"num": 5,
	"imgType": "photo",
	"imgSize": "medium",
	"searchType": "image"
}

response = requests.get('https://www.googleapis.com/customsearch/v1', params = parameters)
responseObj = response.json()

# print type(responseObj) # is 'dict'

