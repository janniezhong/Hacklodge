from __future__ import division

# import environment variables
from environment import *

# general imports
import json
import shutil

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
    return '{"hello":"world"}'

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
	# return json.dumps({
	# 	'title': "Scrambled Eggs",
	# 	'description': "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus reprehenderit quo maiores aut. Expedita dolorem, adipisci ipsum veritatis unde corporis illum quasi, aut delectus soluta repellendus. Quam fuga, quaerat veritatis.",
	# 	'image_url':"https://www.theflavorbender.com/wp-content/uploads/2018/08/Scrambled-Eggs-Featured-500x375.jpg"
	# })
	
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
	myUrl = './uploads/photo.jpg'	

	returnDict = do_ocr(myUrl)
	return json.dumps(returnDict)

@app.route("/upload", methods=['POST'])
def upload():
	print 'printing form keys'
	print request.form.keys()

	print 'printing imgType'
	print request.form.get('imgType')

	if request.form.get('imgType')=='example':
		print 'is example'
		menuID = request.form.get('menuID')
		myID = 1 if menuID is None else menuID

		shutil.copyfile('./static/menu'+str(myID)+'.jpg','./uploads/photo.jpg')

	else:
		print "isn't example"
		print 'printing request.files'
		print request.files

		request.files.get('photo').save('uploads/photo.jpg')

	print 'upload should have worked (?)'
	return '{"status":"success"}'


# for debugging
@app.route("/posttest", methods=['POST'])
def posttest():
    return json.dumps(request.form)

@app.route("/requester")
def requester():
	return render_template('requester.html')


if __name__ == "__main__":
    app.run()
