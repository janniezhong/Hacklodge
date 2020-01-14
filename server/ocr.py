try:
    from PIL import Image
except ImportError:
    import Image
import pytesseract

# basic arithmetic mean helper function
def ocrmean(item):
	return 0.5*(item.get('right')+item.get('left'))

# If you don't have tesseract executable in your PATH, include the following:
pytesseract.pytesseract.tesseract_cmd = r'/usr/local/bin/tesseract'
# Example tesseract_cmd = r'C:\Program Files (x86)\Tesseract-OCR\tesseract'

teststr_1 = './static/menu1.jpeg'

# Get bounding box estimates
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

while i < len(unsortedWords):
	word = ''.join(map(lambda item: item.get('char'), unsortedWords[i]))
	if ''.join(map(lambda item: item.get('char'), unsortedWords[i])).isupper():
		print 'matched'+''.join(map(lambda item: item.get('char'), unsortedWords[i]))
		# del unsortedWords[i]
		# i-=1
	i+=1

# now, sort words

for i in range(len(unsortedWords)):
	sortedWord = sorted(unsortedWords[i], key=ocrmean)

	# now, add spaces
	myWord = []
	for j in range(len(sortedWord)-1):
		myWord.append(sortedWord[j].get('char'))
		diff = sortedWord[j+1].get('left')-sortedWord[j].get('right')
		if(diff > 4):
			myWord.append(' ')

	print ''.join(myWord)



# myWord = []
# for j in range(len(sortedWord)):
# 	myWord.append(sortedWord[j].get('char'))

# print ''.join(myWord)




# first sort characters by top



# find largest gaps, and group into strings

# create subarrays

# sort individual subarrays by left

# convert subarrays to strings
