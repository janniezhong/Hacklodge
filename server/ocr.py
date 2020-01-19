from __future__ import division
try:
    from PIL import Image
except ImportError:
    import Image
import pytesseract
import re

from pytesseract import Output
import cv2
from copy import deepcopy

def do_ocr(url):
	print "ocr is happening!"

	rgx_list = ['(\\$|[0-9]|\\.)+']
	def clean_text(text):
		    new_text = text
		    for rgx_match in rgx_list:
		        new_text = re.sub(rgx_match, '', new_text)
		    return new_text

	pytesseract.pytesseract.tesseract_cmd = r'/usr/local/bin/tesseract'

	# later: https://57b9f852.ngrok.io/static/menu1.jpeg

	myfile = 'menu1'
	# url = './static/'+myfile+'.jpg'
	url = './uploads/photo.jpg'

	print url
	# myImg = Image.open(url)
	myImg = cv2.imread(url)

	# print pytesseract.image_to_string(myImg)

	d = pytesseract.image_to_data(myImg, output_type=Output.DICT)
	n_boxes = len(d['level'])

	# print d
	# print 'there are '+str(n_boxes)+' boxes'

	wordList = []
	# convert these into
	for i in range(n_boxes):
	    (x, y, w, h, word) = (d['left'][i], d['top'][i], d['width'][i], d['height'][i], d['text'][i])
	    (wordNum, lineNum, blockNum) = (d['word_num'][i], d['line_num'][i], d['block_num'][i])

	    wordList.append({
	    	'x': x, 'y': y, 'w': w, 'h': h,
	    	'word': word,
	    	'wordNum': wordNum, 'lineNum': lineNum, 'blockNum': blockNum
	    })
	    
	    # print 'x:'+str(x), '\ty:'+str(y), '\tw:'+str(w), '\th:'+str(h), '\tword:'+word, '\t\t\tword:'+str(wordNum), '\tline:'+str(lineNum), '\tblock:'+str(blockNum)
	    # cv2.rectangle(myImg, (x, y), (x + w, y + h), (0, 255, 0), 2)

	# sort by blockNum, then wordNum
	sortedList = sorted(wordList, key=lambda item: (item.get('blockNum'), item.get('lineNum'), item.get('wordNum')))

	# split list into individual words
	lines = [[]]
	lastIndex = (0, 0)

	for item in sortedList:
		# print str((item.get('blockNum'), item.get('lineNum')))
		index = (item.get('blockNum'), item.get('lineNum'))
		if index != lastIndex:
			# add a new line
			lines.append([item])
		else: 
			lines[-1].append(item)
		lastIndex = deepcopy(index)

	# clean out empty strings, arrays, non-words
	wi = 0
	while wi < len(lines):
		line = lines[wi]
		j = 0
		while j < len(line):
			if len(clean_text(line[j].get('word')))==0:
				# print "found an empty word "+str(line[j])
				del line[j]
				j-=1
			j+=1

		if len(line) == 0:
			del lines[wi]
			wi-=1
		wi+=1

	# clean out non-words

	imgHeight = myImg.shape[0]
	imgWidth =  myImg.shape[1]

	def getBox(line):
		minHozEl = min(line, key=lambda word: word.get('x'))
		maxHozEl = max(line, key=lambda word: word.get('x')+word.get('w'))

		minVerEl = min(line, key=lambda word: word.get('y'))
		maxVerEl = max(line, key=lambda word: word.get('y')+word.get('h'))

		return {
			'left':100*minHozEl.get('x')/imgHeight,
			'top': 100*minVerEl.get('y')/imgHeight,
			'width': 100*(maxHozEl.get('x')+maxHozEl.get('w')-minHozEl.get('x'))/imgWidth,
			'height':100*(maxVerEl.get('y')+maxVerEl.get('h')-minVerEl.get('y'))/imgWidth
		}

	data = map(lambda line: {
		'word': ' '.join(map(lambda item: item.get('word'), line)),
		'box': getBox(line)
	}, lines)

	# clean all caps

	wi = 0
	while wi<len(data):
		if data[wi].get('word').isupper() or len(data[wi].get('word').strip())==0:
			del data[wi]
			wi-=1
		wi+=1

	print data

	return { 'item_list': data }

	# for datum in data:
	# 	box = datum.get('box')
	# 	print (box, datum.get('word'))
		# cv2.rectangle(myImg, (box.get('left'), box.get('top')), (box.get('left')+box.get('width'), box.get('top')+box.get('height')), (0, 255, 0), 2)

	# cv2.imwrite('./static/'+myfile+'_cv.jpg', myImg)


# do_ocr('hello')