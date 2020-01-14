import json
from environment import *

from scrub import *

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
	image_str = getImage(name)
	desc_obj = getDescriptionAndTitle(name)

	returnDict = {
		'title':desc_obj.get("title"),
		'description':desc_obj.get("description"),
		'image_url':image_str
	}
	return json.dumps(returnDict)

# @app.route("/ocr/")

if __name__ == "__main__":
    app.run()
