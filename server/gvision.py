import logging
logging.basicConfig(filename='debug.log',level=logging.DEBUG)

from google.cloud import vision
import io

client = vision.ImageAnnotatorClient()

with io.open('static/menu1.jpeg', 'rb') as image_file:
    content = image_file.read()


image = vision.types.Image(content=content)
response = client.text_detection(image=image)

print 'we made it here'

texts = response.text_annotations
print('Texts:')

for text in texts:
    print('\n"{}"'.format(text.description))

    vertices = (['({},{})'.format(vertex.x, vertex.y)
                for vertex in text.bounding_poly.vertices])

    print('bounds: {}'.format(','.join(vertices)))