try:
    from PIL import Image
except ImportError:
    import Image
import pytesseract
import re

# basic arithmetic mean helper function
def ocrmean(item):
	return 0.5*(item.get('right')+item.get('left'))

pytesseract.pytesseract.tesseract_cmd = r'/usr/local/bin/tesseract'

# later: https://57b9f852.ngrok.io/static/menu1.jpeg

def do_ocr(url):
	teststr_1 = url
	box_data = pytesseract.image_to_boxes(Image.open(teststr_1), output_type=pytesseract.Output.DICT)

	# print box_data.keys()
	# [u'right', u'bottom', u'top', u'char', u'page', u'left']

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

	unsortedWords = [[]]

	for i in range(numChars-1):
		diff = sortByTop[i+1].get('top')-sortByTop[i].get('top')
		unsortedWords[-1].append(sortByTop[i])

		if diff > 7: # 
			unsortedWords.append([])

		if i == numChars-1:
			unsortedWords[-1].append(sortByTop[-1])

	# exclude words based on different formatting

	wi = 0
	while wi < len(unsortedWords):
		word = ''.join(map(lambda item: item.get('char'), unsortedWords[wi]))
		if ''.join(map(lambda item: item.get('char'), unsortedWords[wi])).isupper():
			del unsortedWords[wi]
			wi-=1
		wi+=1

	# now, sort words

	wordList = []
	for i in range(len(unsortedWords)):
		sortedWord = sorted(unsortedWords[i], key=ocrmean)

		# now, add spaces
		myWord = []
		for j in range(len(sortedWord)-1):
			myWord.append(sortedWord[j].get('char'))
			diff = sortedWord[j+1].get('left')-sortedWord[j].get('right')
			if(diff > 4):
				myWord.append(' ')


		wordList.append(''.join(myWord))

	# finally, clean words

	def clean_text(rgx_list, text):
	    new_text = text
	    for rgx_match in rgx_list:
	        new_text = re.sub(rgx_match, '', new_text)
	    return new_text

	regex_list = ['(\\$|[0-9]|\\.)+']
	# clean_text(regex_list, wordList)

	wordList = map(lambda item: clean_text(regex_list, item), wordList)

	# TODO remove this dumb fix for trailing spaces and trailing element (and reverse)
	# [u'Carne Asada Steak ', u'Quesadilla ', u'Carne Asada Plate ', u'Smothered Burrito ', u'Vegetarian Burrito ', u'Fiesta Chicken Burrito ', u'Barbacoa Burrit', u'Beef Burrit', u'Migas con Huev', u'Huevos ocn Chariz', '']

	del wordList[-1]

	for i in range(len(wordList)):
		while wordList[i][-1] == ' ':
			wordList[i] = wordList[i][:-1]

	wordList.reverse()

	returnDict = {
		"item_list": wordList
	}
	return returnDict