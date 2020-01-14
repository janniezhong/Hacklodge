import json

from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/info/<name>")
def info(name):
	returnDict = {
		'name':name,
		'calories':'500'
	}
	return json.dumps(returnDict)

if __name__ == "__main__":
    app.run()


API_KEY = 'AIzaSyC5XBcVJYQeAvln406kzMzTGJwFEwyZQ9I'
CX = '006723745949135884597:oiqnkrgsrxi'