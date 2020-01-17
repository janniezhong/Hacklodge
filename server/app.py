from __future__ import division

# import environment variables
from environment import *

# general imports
import json

# scrub imports
from scrub import *

# ocr imports
from ocr import *

# flask server

from flask import Flask, render_template, request, flash, redirect, url_for
from werkzeug.utils import secure_filename
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/boxes", methods=['POST'])
def boxes():
	print request.form.files['photo']

	return "boxes: [\
      {top:  0, left: 0,  right: 10,  bottom: 10},\
      {top:  30,left: 30, right: 70,  bottom: 45},\
      {top:  0, left: 20, right: 30,  bottom: 10},\
      {top:  90,left: 90, right: 100, bottom: 100}\
    ]\
  }"

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

@app.route("/upload", methods=['POST'])
def upload():
	request.files.get('photo').save('uploads/photo.jpg')

	return '{"message":"successfully connected"}'


# for debugging
@app.route("/posttest", methods=['POST'])
def posttest():
    return json.dumps(request.form)

@app.route("/requester")
def requester():
	return render_template('requester.html')


if __name__ == "__main__":
    app.run()
