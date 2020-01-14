import json

from google.py import *

from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

# things to return: ("scrambled eggs")
# - (string) formatted name of dish ("Scrambled Eggs")
# - (string) url to picture of dish
# - (string) description of dish
@app.route("/info/<name>")
def info(name):
	returnDict = {
		'name':name,
		'calories':'500'
	}
	return json.dumps(returnDict)

if __name__ == "__main__":
    app.run()