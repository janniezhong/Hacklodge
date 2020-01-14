import requests
import re
from bs4 import BeautifulSoup

GOOGLE_CX_STR = "006723745949135884597:oiqnkrgsrxi"
GOOGLE_API_KEY = "AIzaSyC5XBcVJYQeAvln406kzMzTGJwFEwyZQ9I"

# get the first result from Google images
def getImage(name):
	parameters = {
		"q":  name,
		"cx": GOOGLE_CX_STR,
		"key":GOOGLE_API_KEY,
		"num": 1,
		"imgType": "photo",
		"imgSize": "large",
		"searchType": "image"
	}

	response = requests.get('https://www.googleapis.com/customsearch/v1', params = parameters)
	responseObj = response.json()
	items = responseObj.get('items')

	link = items[0].get('link') # return this to the front-end

	return link

# print getImage('scrambled eggs')


def clean_text(rgx_list, text):
    new_text = text
    for rgx_match in rgx_list:
        new_text = re.sub(rgx_match, '', new_text)
    return new_text

# first get a list of pages from wikipedia, then pick the top one and search that
def getDescription(name):
	params1 = {
		"action": "query",
		"format":  "json",
		"list": "search",
		"srsearch": name,
	}

	response1 = requests.get('https://en.wikipedia.org/w/api.php', params = params1).json()

	items = response1.get('query').get('search')

	# link = items[0].get('link') # return this to the front-end
	pageid = items[0].get('pageid')
	print("pageid is "+str(pageid))

	params2 = {
		"action": "parse",
		"format":  "json",
		"prop": "text",
		"pageid": pageid,	
		"contentformat": "text/plain"
	}

	response2 = requests.get('https://en.wikipedia.org/w/api.php', params = params2).json()

	wikitext = response2.get('parse').get('text')
	soup = BeautifulSoup(str(wikitext), 'html.parser')

	# print(soup.prettify())
	# print(soup.get_text())
	paragraphs = soup.find_all('p')
	rgx_list = ['\\\\n', '\[.+?\]']
	return clean_text(rgx_list, paragraphs[0].get_text())

