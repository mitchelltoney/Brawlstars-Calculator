import json
key = {
"8bit":["Penny","Brock","Squeak","Piper"],
"Amber":["Carl","Crow","Piper","Belle","Pam"],
"Angelo":["Kit","Max","Nani"],
"Ash":["Rosa","Frank","Bull","Surge","T>Anti-Tanks", "Lumi"],
"Barley":["Mico","Kenji","Edgar","Mortis","T>Assassins"],
"Bea":["Piper","Sprout","Mr P","T>Throwers"],
"Belle":["Nani","Darryl","Piper"],
"Berry":["Barley","Kenji","Mortis","T>Assassins"],
"Bibi":["Surge","El Primo","Cordelius","Shelly"],
"Bo":["Piper","Stu","Max","Leon"],
"Bonnie":["Piper","Darryl","RT","Colette"],
"Brock":["Max","Nani","Piper","Mandy"],
"Bull":["Nita","Griff","Gale","T>Anti-tanks", "Lumi"],
"Buster":["Rosa","Darryl","Jacky","Buzz","El Primo"],
"Buzz":["Surge","Gale","Jacky"],
"Byron":["Piper","Lou","Sprout"],
"Carl":["Buzz","Surge","Darryl","Jacky","Gene"],
"Charlie":["Penny","Barley","Sandy","Juju","Larry"],
"Chester":["Janet","Amber","Stu","Gale"],
"Chuck":["Cordelius","Bull","Angelo","Clancy","Melodie"],
"Clancy":["Belle","Tara","Penny"],
"Colette":["Belle","Stu","Bea","Griff","Jessie"],
"Colt":["Piper","Belle","Gus"],
"Cordelius":["Frank","Buster","Surge","Nita"],
"Crow":["Piper","Spike","T>Tanks"],
"Darryl":["Cordelius","Otis","Clancy"],
"Doug":["Frank","Clancy","Griff"],
"Draco":["Lou","Nita","Frank"],
"Dynamike":["Mico","Mortis","Kenji","Edgar","Darryl"],
"Edgar":["Surge","Doug","Jacky","Shelly"],
"El Primo":["Cordelius","Gale","Shelly", "Lumi"],
"Emz":["Mortis","Barley","Juju","Larry","Janet"],
"Eve":["Piper","Penny","Janet","Max"],
"Fang":["Clancy","Otis","Shelly","Gale"],
"Finx":["El Primo"],
"Frank":["Colette","El Primo","Griff","Chester", "Lumi", "Rico"],
"Gale":["Janet","Amber","T>Thrower","Penny"],
"Gene":["Mr P","Penny","Tara","Eve","Charlie","Belle"],
"Gray":["Mr P","Charlie","Gus"],
"Griff":["Lola","Stu","Bea"],
"Grom":["Mico","Mortis","Kenji","Darryl", "Kaze","T>Assassins"],
"Gus":["Piper","Mr P","Darryl"],
"Hank":["Dynamike","Frank","Gale"],
"Jacky":["Frank","Gale","Rosa"],
"Jae Young":["Bea", "Buster", "Gene"],
"Janet":["Frank","Carl","Kenji","Belle"],
"Jessie":["T>Thrower","Belle","Squeak"],
"Juju":["Frank","Tick","Larry","T>Wallbreaker"],
"Kaze":["Shelly", "Chester", "Bull"],
"Kenji":["Frank","Draco","El Primo"],
"Kit":["Charlie","Cordelius","RT","Chester"],
"Larry":["Tick","Edgar","Kenji"],
"Leon":["Crow","Stu","Pearl"],
"Lily":["RT","Jacky","Bull","Shelly"],
"Lola":["Belle","Penny","Amber"],
"Lou":["Belle","Bea","Bo","Poco","T>Thrower"],
"Lumi":["Dynamike", "Grom", "Barley"],
"Maisie":["Barley","Stu","Belle","Penny"],
"Mandy":["Nani","Tick","Mortis","T>Thrower"],
"Max":["Crow","Gus","Pam","Stu"],
"Meeple":["Kenji","Frank","Ash"],
"Meg":["Colette","Lou","Lola","Bea"],
"Melodie":["Clancy","Cordelius","Buzz"],
"Mico":["RT","Bull","Stu"],
"Moe":["Penny","Darryl","Larry"],
"Mortis":["Jacky","Shade","Bull","Gale","Shelly"],
"Mr P":["Edgar","Mortis","Bibi"],
"Nani":["Gene","Max","Darryl","Tick"],
"Nita":["Barley","Juju","Larry","Spike","Griff"],
"Ollie":["Colette", "Otis", "Surge", "Lou", "RT"],
"Otis":["Barley","Juju","Larry","Stu","Amber"],
"Pam":["Jessie","Lou","8Bit","Colette", "Lumi"],
"Pearl":["Lou","8Bit","Buster"],
"Penny":["T>Thrower","Squeak","Kenji","Bo"],
"Piper":["Nani","Tick","Kit","Kenji"],
"Poco":["Emz","Mortis","Jessie"],
"RT":["T>Thrower","Gus","Max","Bo"],
"Rico":["T>Thrower","Brock","Piper","Stu"],
"Rosa":["Shelly","Emz","Frank"],
"Ruffs":["Buzz","Carl","Sprout","T>Assassins"],
"Sam":["Surge","Lou","Griff"],
"Sandy":["Nita","Janet","Kenji","Larry"],
"Shade":["Frank","Lou","Jacky"],
"Shelly":["Stu","Nita","Spike","Penny"],
"Spike":["T>Thrower","Squeak","Carl","Piper"],
"Sprout":["Mico","Mortis","Edgar","Frank", "Darryl"],
"Squeak":["T>Assasins","Ash","Kenji","Mortis","Buzz", "Edgar", "Darryl"],
"Stu":["T>Healer","T>Sniper","Ruffs","Penny","Sandy","Poco","Belle"],
"Surge":["T>Thrower","Ruffs","Tara","Charlie","Spike"],
"Tara":["T>Thrower","Otis","Sandy","Janet"],
"Tick":["Mico","Mortis","Darryl","Bibi", "Kenji"],
"Willow":["Barley","Larry","Buzz"]
}
def countBrawler(name, counts): counts[name]=counts.get(name,0)+1
# def returnBrawlerString(name,counterclasses=True):
#     brawlerList=[]; counterClass="Counter Classes: "; count=0
#     for counter in key[name]:
#         if "T>" in counter:
#             counterClass+=((", " if count else "")+counter[2:]); count+=1; continue
#         brawlerList.append(counter)
#     return("—"*44+"\\n"+f"{name} Counters: "+", ".join(brawlerList)+
#            (("\\n"+counterClass)*(count>0)*counterclasses)+"\\n"+"—"*44)
def handleCases(name):
    raw = name.strip()
    for k in key.keys():
        if k.lower() == raw.lower():
            return k
    n=raw.lower()
    if "primo" in n: return "El Primo"
    if "miko"  in n: return "Mico"
    if "mike"  in n: return "Dynamike"
    if "barry" in n: return "Berry"
    return raw.title()
def calculate(inputs):
    selected = []
    counts = {}
    for raw in inputs:
        if not raw: continue
        b = handleCases(raw.strip())
        if b in selected or b not in key: continue
        selected.append(b)
        for x in key[b]:
            countBrawler(x, counts)
    results = []
    for b in selected:
        direct = [c for c in key[b] if not c.startswith("T>")]
        classes = [c[2:] for c in key[b] if c.startswith("T>")]
        results.append({
            "brawler": b,
            "counters": direct,
            "classes": classes
        })
    doubles = [k for k,v in counts.items() if v == 2]
    triples = [k for k,v in counts.items() if v == 3]
    return json.dumps({
        "results": results,
        "doubleOverlaps": doubles,
        "tripleOverlaps": triples
    })