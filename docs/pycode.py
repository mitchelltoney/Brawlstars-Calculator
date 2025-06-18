import json
key = {
"8bit":["Penny","Brock","Squeak","Piper"],
"Amber":["Carl","Crow","Piper","Belle","Pam"],
"Angelo":["Kit","Max","Nani"],
"Ash":["Rosa","Frank","Bull","Surge","T>Anti-Tanks"],
"Barley":["Mico","Kenji","Edgar","Mortis","T>Assassins"],
"Bea":["Piper","Sprout","Mr. P","T>Throwers"],
"Belle":["Nani","Darryl","Piper"],
"Berry":["Barley","Kenji","Mortis","T>Assassins"],
"Bibi":["Surge","El Primo","Cordelius","Shelly"],
"Bo":["Piper","Stu","Max","Leon"],
"Bonnie":["Piper","Darryl","RT","Colette"],
"Brock":["Max","Nani","Piper","Mandy"],
"Bull":["Nita","Griff","Gale","T>Anti-tanks"],
"Buster":["Rosa","Darryl","Jacky","Buzz","Primo"],
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
"El Primo":["Cordelius","Gale","Shelly"],
"Emz":["Mortis","Barley","Juju","Larry","Janet"],
"Eve":["Piper","Penny","Janet","Max"],
"Fang":["Clancy","Otis","Shelly","Gale"],
"Frank":["Collete","Primo","Griff","Chester"],
"Gale":["Janet","Amber","T>Thrower","Penny"],
"Gene":["Mr P","Penny","Tara","Eve","Charlie","Bell"],
"Gray":["Mr P","Charlie","Gus"],
"Griff":["Lola","Stu","Bea"],
"Grom":["Mico","Mortis","Kenji","Darryl", "Kaze","T>Assassins"],
"Gus":["Piper","Mr P","Darryl"],
"Hank":["Dynamike","Frank","Gale"],
"Jacky":["Frank","Gale","Rosa"],
"Janet":["Frank","Carl","Kenji","Bell"],
"Jesse":["T>Thrower","Bell","Squeak"],
"Juju":["Frank","Tick","Larry","T>Wallbreaker"],
"Kaze":["Idk tbh sry."],
"Kenji":["Frank","Draco","Primo"],
"Kit":["Charlie","Cordelius","RT","Chester"],
"Larry":["Tick","Edgar","Kenji"],
"Leon":["Crow","Stu","Pearl"],
"Lily":["RT","Jacky","Bull","Shelly"],
"Lola":["Bell","Penny","Amber"],
"Lou":["Bell","Bea","Bo","Poco","T>Thrower"],
"Maisie":["Barley","Stu","Bell","Penny"],
"Mandy":["Nani","Tick","Mortis","T>Thrower"],
"Max":["Crow","Gus","Pam","Stu"],
"Meple":["Kenji","Frank","Ash"],
"Meg":["Colette","Lou","Lola","Bea"],
"Melodie":["Clancy","Cordelius","Buzz"],
"Mico":["RT","Bull","Stu"],
"Moe":["Penny","Darryl","Larry"],
"Mortis":["Jacky","Shade","Bull","Gale","Shelly"],
"Mr P":["Edgar","Mortis","Bibi"],
"Nani":["Gene","Max","Darryl","Tick"],
"Nita":["Barley","Juju","Larry","Spike","Griff"],
"Otis":["Barley","Juju","Larry","Stu","Amber"],
"Pam":["Jesse","Lou","8-Bit","Collete"],
"Pearl":["Lou","8-Bit","Buster"],
"Penny":["T>Thrower","Squeak","Kenji","Bo"],
"Piper":["Nani","Tick","Kit","Kenji"],
"Poco":["Emz","Mortis","Jesse"],
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
"Tick":["Mico","Mortis","Darryl","Bibi"],
"Willow":["Barley","Larry","Buzz"]
}
def countBrawler(name, counts): counts[name]=counts.get(name,0)+1
def returnBrawlerString(name,counterclasses=True):
    brawlerList=[]; counterClass="Counter Classes: "; count=0
    for counter in key[name]:
        if "T>" in counter:
            counterClass+=((", " if count else "")+counter[2:]); count+=1; continue
        brawlerList.append(counter)
    return("—"*44+"\\n"+f"{name} Counters: "+", ".join(brawlerList)+
           (("\\n"+counterClass)*(count>0)*counterclasses)+"\\n"+"—"*44)
def handleCases(name):
    n=name.lower()
    if "primo" in n: return "El Primo"
    if "miko"  in n: return "Mico"
    if "mike"  in n: return "Dynamike"
    if "barry" in n: return "Berry"
    return name.title()
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