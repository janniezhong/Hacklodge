from __future__ import division
try:
    from PIL import Image
except ImportError:
    import Image
import pytesseract
import re

# basic arithmetic mean helper function
def ocrmean(item):
	return 0.5*(item.get('right')+item.get('left'))

def clean_text(rgx_list, text):
	    new_text = text
	    for rgx_match in rgx_list:
	        new_text = re.sub(rgx_match, '', new_text)
	    return new_text

pytesseract.pytesseract.tesseract_cmd = r'/usr/local/bin/tesseract'

# later: https://57b9f852.ngrok.io/static/menu1.jpeg

def do_ocr(url):
	teststr_1 = url
	rawImg = Image.open(teststr_1)

	# get image data
	imgWidth, imgHeight = rawImg.size

	ratio = 1000/imgWidth
	# ratio = 1

	myImg = rawImg
	# myImg = myImg.resize((int(imgWidth*ratio), int(imgHeight*ratio)))
	myImg = myImg.rotate(-90)

	imgWidth, imgHeight = myImg.size

	print 'width ' + str(imgWidth)
	print 'height '+ str(imgHeight)

	# pdf = pytesseract.image_to_pdf_or_hocr(teststr_1, extension='pdf')
	# with open('test.pdf', 'w+b') as f:
	# 	f.write(pdf) # pdf type is bytes by default

	# return pytesseract.image_to_string(myImg)

	box_data = pytesseract.image_to_boxes(myImg, output_type=pytesseract.Output.DICT)

	print pytesseract.image_to_string(myImg)

	pdf = pytesseract.image_to_pdf_or_hocr(myImg, extension='pdf')
	with open('test.pdf', 'w+b') as f:
		f.write(pdf) # pdf type is bytes by default

	numChars = len(box_data.get('right'))

	# convert dict of lists to list of dicts

	charList = []
	for i in range(numChars):
		charList.append({
			'char':   box_data.get('char')[i],
			'right':  box_data.get('right')[i],
			'bottom': box_data.get('bottom')[i],
			'left':   box_data.get('left')[i],
			'top':    box_data.get('top')[i]
		})


	sortByTop = sorted(charList, key=lambda item: item.get('top'))

	# this is a two-dimensional array
	unsortedWords = [[]]

	for i in range(numChars-1):
		diff = sortByTop[i+1].get('top')-sortByTop[i].get('top')
		unsortedWords[-1].append(sortByTop[i])

		if diff > 7: # 
			unsortedWords.append([])

		if i == numChars-1:
			unsortedWords[-1].append(sortByTop[-1])

	print 'number of unsorted words: '+str(len(unsortedWords))

	if len(unsortedWords[-1]) == 0:
		del unsortedWords[-1]

	# exclude words based on different formatting

	# wi = 0
	# while wi < len(unsortedWords):
	# 	word = ''.join(map(lambda item: item.get('char'), unsortedWords[wi]))
	# 	if ''.join(map(lambda item: item.get('char'), unsortedWords[wi])).isupper():
	# 		del unsortedWords[wi]
	# 		wi-=1
	# 	wi+=1

	# sort words (by left)

	sortedWords = []
	boxes = []
	wordList = []

	for i in range(len(unsortedWords)):
		sortedWord = sorted(unsortedWords[i], key=ocrmean)

		# generate boxes
		boxes.append({'left':-1, 'right': -1, 'top':-1, 'bottom':-1})
		boxes[i]['left'] =  (sortedWord[0]['left']/imgWidth)*100;
		boxes[i]['right'] = (sortedWord[-1]['right']/imgWidth)*100;

		boxes[i]['top']   = 100-(max(sortedWord, key=lambda item: item['top'])['top']/imgHeight)*100;
		boxes[i]['bottom']= 100-(min(sortedWord, key=lambda item: item['bottom'])['bottom']/imgHeight)*100;

		# now, add spaces
		myWord = []
		for j in range(len(sortedWord)-1):
			myWord.append(sortedWord[j].get('char'))
			diff = sortedWord[j+1].get('left')-sortedWord[j].get('right')
			if(diff > 4):
				myWord.append(' ')

		sortedWords.append(''.join(myWord))

	# finally, clean word

	regex_list = ['(\\$|[0-9]|\\.)+']
	# clean_text(regex_list, wordList)

	wordList = map(lambda item: clean_text(regex_list, item), sortedWords)

	# TODO remove this dumb fix for trailing spaces and trailing element (and reverse)
	# [u'Carne Asada Steak ', u'Quesadilla ', u'Carne Asada Plate ', u'Smothered Burrito ', u'Vegetarian Burrito ', u'Fiesta Chicken Burrito ', u'Barbacoa Burrit', u'Beef Burrit', u'Migas con Huev', u'Huevos ocn Chariz', '']

	# del wordList[-1]

	for i in range(len(wordList)):
		wordList[i] = wordList[i].strip()

	itemList = [{'word': wordList[i], 'box':boxes[i]} for i in range(len(wordList))]

	itemList.reverse()

	returnDict = {
		"item_list": itemList,
	}

	print 'returning from OCR:'
	print returnDict

	return returnDict

# print do_ocr('./static/menu1.jpeg')
# print do_ocr('./uploads/photo.jpg')
# print do_ocr('./static/cameratest.jpg')