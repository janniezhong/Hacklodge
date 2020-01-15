# import environment variables
from environment import *

# general imports
import json

# scrub imports
from scrub import *

# ocr imports
from ocr import *

# flask server
from flask import Flask, render_template, request
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

# things to return: ("scrambled eggs")
# - (string) formatted name of dish ("Scrambled Eggs")
# - (string) url to picture of dish
# - (string) description of dish
@app.route("/info", methods=['POST'])
def info():
	name = request.form.get('name')
	image_str = getImage(name)
	desc_obj = getDescriptionAndTitle(name)

	returnDict = {
		'title':desc_obj.get("title"),
		'description':desc_obj.get("description"),
		'image_url':image_str
	}
	return json.dumps(returnDict)

@app.route("/ocr", methods=['POST'])
def ocr():
	menuid = request.form.get('menu_id')

	myUrl = './static/menu1.jpeg'
	if menuid == '2':
		myUrl = './static/menu2.jpeg'
		print myUrl
	elif menuid == '3':
		myUrl = './static/menu3.jpeg'

	returnDict = do_ocr(myUrl)
	return json.dumps(returnDict)


# for debugging
@app.route("/posttest", methods=['POST'])
def posttest():
    return json.dumps(request.form)

@app.route("/requester")
def requester():
	return render_template('requester.html')


if __name__ == "__main__":
    app.run()
