"""
Reformats URLs in renderings.js to receive a list of IIIF URLs per annotation file in renderings2.js
"""

import json

def filterRelevantImagesBySide(sidestring,imageurls):
    result=[]
    for img in imageurls:
        if sidestring in img["label"]:
            result.append(img["url"])
    return result
    
def sideStringFromURI(uri):
    result=[]
    if "back" in uri:
        return "back"
    if "front" in uri:
        return "front"
    if "right" in uri:
        return "right"
    if "left" in uri:
        return "left"
    if "top" in uri:
        return "top"
    if "bottom" in uri:
        return "bottom"
    return ""

result={}
f=open("../js/data/renderings.js")
urlformat=json.loads(f.read().replace("var urls=",""))
for item in urlformat:
    print(item)
    if "variants" in urlformat[item]:
        for var in urlformat[item]["variants"]:
            sidestring=sideStringFromURI(var["label"])
            if item+"_"+sidestring+".json" not in result:
                result[item+"_"+sidestring+".json"]=[]
            result[item+"_"+sidestring+".json"].append(var["url"])
f2=open("../js/data/renderings2.js", "w",encoding="utf-8")
f2.write(json.dumps(result))
f2.close()
